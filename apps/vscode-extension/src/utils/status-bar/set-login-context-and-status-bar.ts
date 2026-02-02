import { getTodaysLocaleDate } from "@repo/common/get-todays-locale-date";

import { setLoginContext } from "../auth/login-context";
import { getGlobalStateData } from "../global-state/get-global-state-data";
import { setStatusBarItem } from "./set-status-bar-item";

export const setLoginContextAndStatusBar = async () => {
  await setLoginContext(true);
  const dateString = getTodaysLocaleDate();

  const { dailyData } = await getGlobalStateData();
  const timeSpentToday = dailyData[dateString]?.timeSpentOnDay || 0;

  setStatusBarItem({ type: "time", timeSpentToday });
};
