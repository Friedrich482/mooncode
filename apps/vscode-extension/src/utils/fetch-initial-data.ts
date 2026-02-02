import { FileDataSync } from "@/types-schemas";
import { getTodaysLocaleDate } from "@repo/common/get-todays-locale-date";
import { TRPCClientError } from "@trpc/client";

import { getGlobalStateData } from "./global-state/get-global-state-data";
import { logError, logInfo } from "./logger/logger";
import { trpc } from "./trpc/client";

export const fetchInitialData = async () => {
  const dateString = getTodaysLocaleDate();

  let timeSpentFromGlobalState = 0;
  let initialFilesDataFromGlobalState: FileDataSync = {};

  let timeSpentFromServer = 0;
  let initialFilesDataFromServer: FileDataSync = {};

  let serverDataFetchedSuccessfully = false;

  try {
    const { timeSpent } = await trpc.extension.getLanguagesTimeForDay.query({
      dateString,
    });

    const dayFilesData = await trpc.extension.getFilesForDay.query({
      dateString,
    });

    timeSpentFromServer = timeSpent;
    initialFilesDataFromServer = dayFilesData;

    serverDataFetchedSuccessfully = true;
  } catch (error) {
    if (error instanceof TRPCClientError) {
      logError(`tRPC Error: ${error.message}, Cause: ${error.cause}`);
    } else {
      logError(`Unknown error during server fetch: ${error}`);
    }
  }

  const globalStateData = await getGlobalStateData();

  const { timeSpentOnDay, dayFilesData } = globalStateData.dailyData?.[
    dateString
  ] ?? {
    timeSpentOnDay: 0,
    dayFilesData: {},
  };

  timeSpentFromGlobalState = timeSpentOnDay;
  initialFilesDataFromGlobalState = dayFilesData;

  if (serverDataFetchedSuccessfully) {
    if (timeSpentFromServer >= timeSpentFromGlobalState) {
      // Server wins
      return {
        timeSpent: timeSpentFromServer,
        initialFilesData: initialFilesDataFromServer,
      };
    }

    // Global state wins
    return {
      timeSpent: timeSpentFromGlobalState,
      initialFilesData: initialFilesDataFromGlobalState,
    };
  } else {
    // Server data is NOT available, must use global state data
    logInfo("Server is unavailable, using the global state instead");

    return {
      timeSpent: timeSpentFromGlobalState,
      initialFilesData: initialFilesDataFromGlobalState,
    };
  }
};
