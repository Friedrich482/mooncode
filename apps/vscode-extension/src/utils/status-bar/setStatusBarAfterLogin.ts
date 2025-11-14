import getTodaysLocalDate from "@repo/common/getTodaysLocalDate";

import getGlobalStateData from "../global-state/getGlobalStateData";
import setStatusBarItem from "./setStatusBarItem";

const setStatusBarAfterLogin = async () => {
  const dateString = getTodaysLocalDate();

  const { dailyData } = await getGlobalStateData();
  const timeSpentToday = dailyData[dateString]?.timeSpentOnDay || 0;

  setStatusBarItem({ type: "time", timeSpentToday });
};

export default setStatusBarAfterLogin;
