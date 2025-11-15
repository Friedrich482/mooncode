import { GlobalStateData } from "@/types-schemas";
import getTodaysLocalDate from "@repo/common/getTodaysLocalDate";

import deleteFilesDataContent from "../files/deleteFilesDataContent";
import updateGlobalStateData from "../global-state/updateGlobalStateData";

const isNewDayHandler = async (
  dailyData: GlobalStateData["dailyData"],
  lastServerSync: Date
) => {
  const todaysDateString = getTodaysLocalDate();

  // if the global state doesn't have that date, it means it a new day
  if (!Object.hasOwn(dailyData, todaysDateString)) {
    deleteFilesDataContent();

    const newGlobalStateData = {
      lastServerSync,
      dailyData: {
        ...dailyData,
        [todaysDateString]: {
          timeSpentOnDay: 0,
          timeSpentPerLanguage: {},
          dayFilesData: {},
          updatedAt: new Date(),
        },
      },
    };

    await updateGlobalStateData(newGlobalStateData);

    return newGlobalStateData;
  }
};

export default isNewDayHandler;
