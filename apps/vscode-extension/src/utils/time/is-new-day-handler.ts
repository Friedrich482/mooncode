import { GlobalStateData } from "@/types-schemas";
import { getLocaleDate } from "@repo/common/get-locale-date";

import { deleteFilesDataContent } from "../files/delete-files-data-content";
import { updateGlobalStateData } from "../global-state/update-global-state-data";

export const isNewDayHandler = async (
  dailyData: GlobalStateData["dailyData"],
  lastServerSync: Date,
) => {
  const todaysDateString = getLocaleDate(new Date());

  // if the global state doesn't have that date, it means it is a new day
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
