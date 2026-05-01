import { ThemeColor } from "vscode";

import { getStatusBarItem } from "@/extension";
import { formatDuration } from "@repo/common/format-duration";

type SetStatusBarItem =
  | {
      type: "time";
      timeSpentToday: number;
    }
  | {
      type: "auth";
    };

export const setStatusBarItem = (item: SetStatusBarItem) => {
  const statusBarItem = getStatusBarItem();

  if (item.type === "time") {
    const { timeSpentToday } = item;
    statusBarItem.text = `$(watch) ${formatDuration(timeSpentToday)}`;
    statusBarItem.backgroundColor = new ThemeColor(
      "statusBarItem.activeBackground",
    );
    statusBarItem.tooltip =
      "MoonCode: Time spent coding today. Click to open your dashboard";
    statusBarItem.command = "MoonCode.openDashboard";

    return;
  }

  statusBarItem.text = `$(watch) MoonCode Login`;
  statusBarItem.backgroundColor = new ThemeColor(
    "statusBarItem.warningBackground",
  );
  statusBarItem.command = "MoonCode.login";
  statusBarItem.tooltip =
    "MoonCode: You are currently logged out. Click to login";
};
