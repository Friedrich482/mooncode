import * as vscode from "vscode";
import { FileDataSync } from "@/types-schemas";
import { TRPCClientError } from "@trpc/client";
import getGlobalStateData from "./global-state/getGlobalStateData";
import getTodaysLocalDate from "@repo/common/getTodaysLocalDate";
import trpc from "./trpc/client";

const fetchInitialData = async () => {
  const dateString = getTodaysLocalDate();

  let timeSpentFromGlobalState = 0;
  let initialFilesDataFromGlobalState: FileDataSync = {};

  let timeSpentFromServer = 0;
  let initialFilesDataFromServer: FileDataSync = {};

  let serverDataFetchedSuccessfully = false;

  try {
    const { timeSpent } =
      await trpc.codingStats.getDailyStatsForExtension.query({
        dateString,
      });

    const dayFilesData =
      await trpc.filesStats.getDailyFilesStatsForExtension.query({
        dateString,
      });

    timeSpentFromServer = timeSpent;
    initialFilesDataFromServer = dayFilesData;

    serverDataFetchedSuccessfully = true;
  } catch (error) {
    if (error instanceof TRPCClientError) {
      vscode.window.showErrorMessage(
        `tRPC Error: ${error.message}, Cause: ${error.cause}`,
      );
    } else {
      vscode.window.showErrorMessage(
        `Unknown error during server fetch: ${error}`,
      );
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
    vscode.window.showInformationMessage(
      "Server is unavailable, using the global state instead",
    );

    return {
      timeSpent: timeSpentFromGlobalState,
      initialFilesData: initialFilesDataFromGlobalState,
    };
  }
};

export default fetchInitialData;
