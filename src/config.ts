import * as vscode from "vscode";
import { myStatusBarItem } from "./extension";
import * as monitor from "./monitor";

let pluginConfig: vscode.WorkspaceConfiguration;

export function refreshConfig() {
  pluginConfig = vscode.workspace.getConfiguration("Against996");
}

refreshConfig();

export function getTimeConfig(key: string) {
  const config = pluginConfig.get<string>(key);
  if (!config) {
    return config as undefined;
  }
  const [hour, minute, second] = config.split(":");
  return {
    value: config,
    hour: +hour,
    minute: +minute,
    second: +second,
  };
}
type TimeConfig = ReturnType<typeof getTimeConfig>;

const CONFIG = new Proxy(
  {
    startTime: {
      value: "09:00:00",
      hour: 9,
      minute: 0,
      second: 0,
    },
    endTime: {
      value: "18:00:00",
      hour: 18,
      minute: 0,
      second: 0,
    },
    countDownCloseWindow: "5",
    startText: "宝贝,还没到上班时间,着急啥!",
    startConfirmText: "好的,不急",
    endText: "{{time}}s后强制关闭! 宝贝,还不赶紧下班!",
  },
  {
    get(target, key: string, receiver) {
      let v = undefined;
      const isTime = key.toString().toLowerCase().includes("time");
      if (isTime) {
        v = getTimeConfig(key);
      } else {
        v = pluginConfig.get(key);
      }
      return v ?? Reflect.get(target, key, receiver);
    },
  }
);

export default CONFIG;

export const handleConfigChangeListener =
  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("Against996")) {
      refreshConfig();
    }
    const timeConfigs = ["Against996.startTime", "Against996.endTime"];
    const hasTimeChange = timeConfigs.some((k) => e.affectsConfiguration(k));
    if (hasTimeChange) {
      monitor.update();
      myStatusBarItem.text = `Against 996(${CONFIG.startTime.value} - ${CONFIG.endTime.value})`;
    }
  });
