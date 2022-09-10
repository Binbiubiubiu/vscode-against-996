// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as monitor from "./monitor";
import CONFIG, { handleConfigChangeListener } from "./config";

export let myStatusBarItem: vscode.StatusBarItem;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate({ subscriptions }: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "Against996" is now active!');

  const myCommandId = "Against996.against996";
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    myCommandId,
    monitor.checkIsWorktime
  );

  subscriptions.push(disposable);
  // create a new status bar item that we can now manage
  myStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    1
  );
  myStatusBarItem.command = myCommandId;
  myStatusBarItem.text = `Against 996(${CONFIG.startTime.value} - ${CONFIG.endTime.value})`;
  myStatusBarItem.show();
  subscriptions.push(myStatusBarItem);

  // update status bar item once at start
  monitor.listen();
  subscriptions.push(handleConfigChangeListener);
  monitor.checkIsWorktime();
}

// this method is called when your extension is deactivated
export function deactivate() {
  monitor.close();
}
