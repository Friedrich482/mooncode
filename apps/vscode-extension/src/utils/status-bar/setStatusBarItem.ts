import { getStatusBarItem } from "@/extension";
import formatDuration from "@repo/common/formatDuration";

type SetStatusBarItem =
  | {
      type: "time";
      timeSpentToday: number;
    }
  | {
      type: "auth";
    };

const setStatusBarItem = (item: SetStatusBarItem) => {
  const statusBarItem = getStatusBarItem();

  if (item.type === "time") {
    const { timeSpentToday } = item;
    statusBarItem.text = `$(watch) ${formatDuration(timeSpentToday)}`;
    statusBarItem.tooltip =
      "MoonCode: Time spent coding today. Click to open your dashboard";
    statusBarItem.command = "MoonCode.openDashboard";

    return;
  }

  statusBarItem.text = `$(watch) MoonCode Login`;
  statusBarItem.command = "MoonCode.login";
  statusBarItem.tooltip =
    "MoonCode: You are actually logged out. Click to login";
};

export default setStatusBarItem;
