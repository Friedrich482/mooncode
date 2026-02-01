import vscode from "vscode";

export const addStatusBarItem = () => {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    200,
  );
  statusBarItem.text = "$(watch) MoonCode";
  statusBarItem.tooltip =
    "MoonCode: Time spent coding today. Click to open your dashboard";
  statusBarItem.command = "MoonCode.openDashboard";
  statusBarItem.show();

  return statusBarItem;
};
