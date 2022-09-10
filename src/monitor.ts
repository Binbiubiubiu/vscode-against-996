import * as vscode from "vscode";
import * as dayjs from "dayjs";
import * as schedule from "node-schedule";
import CONFIG from "./config";
import { isTodayHoliday } from "./api";

let isHoliday = false;
async function initConfig() {
  isHoliday = await isTodayHoliday();
  checkIsWorktime();
}
initConfig();

// 没到上班时间
async function isBeforeWorktime(now: dayjs.Dayjs) {
  const { hour, minute, second } = CONFIG.startTime;
  const startTime = dayjs().hour(hour).minute(minute).second(second);

  return now.isBefore(startTime);
}

async function beforeWorktimeAction(flag: boolean = false) {
  if (isHoliday || !flag) {
    return;
  }
  vscode.window
    .showWarningMessage(CONFIG.startText, CONFIG.startConfirmText)
    .then((rt) => rt && closeWindow());
}

// 已经下班了
async function isAfterWorktime(now: dayjs.Dayjs) {
  const { hour, minute, second } = CONFIG.endTime;
  const endTime = dayjs().hour(hour).minute(minute).second(second);

  return now.isAfter(endTime);
}

async function afterWorktimeAction(flag: boolean = false) {
  if (isHoliday || !flag) {
    return;
  }

  let time = +CONFIG.countDownCloseWindow;
  const endText = CONFIG.endText;
  const timeId = setInterval(() => {
    if (time === 0) {
      clearInterval(timeId);
      closeWindow();
      return;
    }
    vscode.window.showWarningMessage(
      endText.replace(/\{\{time\}\}/g, "" + time--)
    );
  }, 1000);
}

export async function checkIsWorktime() {
  const now = dayjs();
  isBeforeWorktime(now).then(beforeWorktimeAction);
  isAfterWorktime(now).then(afterWorktimeAction);
}
let startWorkJob: schedule.Job;
let endWorkJob: schedule.Job;
let isHolidayJob: schedule.Job;

export async function listen() {
  const st = CONFIG.startTime;
  startWorkJob = schedule.scheduleJob(
    `${st.second} ${st.minute} ${st.hour} * * ?`,
    () => beforeWorktimeAction(true)
  );
  const et = CONFIG.endTime;
  endWorkJob = schedule.scheduleJob(
    `${et.second} ${et.minute} ${et.hour} * * ?`,
    () => afterWorktimeAction(true)
  );
  isHolidayJob = schedule.scheduleJob("0 0 0 * * ?", initConfig);
}

export async function update() {
  if (startWorkJob) {
    const st = CONFIG.startTime;
    startWorkJob.reschedule(`${st.second} ${st.minute} ${st.hour} * * ?`);
  }

  if (endWorkJob) {
    const et = CONFIG.endTime;
    endWorkJob.reschedule(`${et.second} ${et.minute} ${et.hour} * * ?`);
  }
}

export async function close() {
  schedule.gracefulShutdown();
}

function closeWindow() {
  vscode.commands.executeCommand("workbench.action.closeWindow");
}
