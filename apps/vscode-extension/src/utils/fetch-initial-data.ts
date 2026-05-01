import { FileDataSync } from "@/types-schemas";
import { getLocaleDate } from "@repo/common/get-locale-date";

import { handleInvalidTokenError } from "./errors/handle-invalid-token-error";
import { getGlobalStateData } from "./global-state/get-global-state-data";
import { logError, logInfo } from "./logger/logger";
import { isTRPCClientError, trpc } from "./trpc/client";

export const fetchInitialData = async () => {
  const dateString = getLocaleDate(new Date());

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
    if (isTRPCClientError(error)) {
      logError(
        `tRPC Error: ${error.message}, Cause: ${error.cause}, Code: ${error.data?.code}.`,
      );
      await handleInvalidTokenError(error);
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
