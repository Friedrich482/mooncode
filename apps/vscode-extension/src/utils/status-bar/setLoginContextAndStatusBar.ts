import getTodaysLocalDate from "@repo/common/getTodaysLocalDate";

import { setLoginContext } from "../auth/loginContext";
import getGlobalStateData from "../global-state/getGlobalStateData";
import setStatusBarItem from "./setStatusBarItem";

const setLoginContextAndStatusBar = async () => {
  await setLoginContext(true);
  const dateString = getTodaysLocalDate();

  const { dailyData } = await getGlobalStateData();
  const timeSpentToday = dailyData[dateString]?.timeSpentOnDay || 0;

  setStatusBarItem({ type: "time", timeSpentToday });
};

export default setLoginContextAndStatusBar;
