import { isEqual } from "date-fns";
import * as vscode from "vscode";

import getTodaysLocalDate from "@repo/common/getTodaysLocalDate";
import { TRPCClientError } from "@trpc/client";

import { getLoginContext } from "./auth/loginContext";
import updateFilesDataAfterSync from "./files/updateFilesDataAfterSync";
import getGlobalStateData from "./global-state/getGlobalStateData";
import updateGlobalStateData from "./global-state/updateGlobalStateData";
import { logError } from "./logger/logger";
import setStatusBarItem from "./status-bar/setStatusBarItem";
import calculateTime from "./time/calculateTime";
import trpc from "./trpc/client";

const periodicSyncData = async (
  getTime: Awaited<ReturnType<typeof calculateTime>>,
) => {
  const todaysDateString = getTodaysLocalDate();
  let lastServerSync = new Date();
  let isServerSynced = false;
  let timeSpentOnDay = 0;

  const filesDataToUpsert = getTime();

  const timeSpentToday = Object.values(filesDataToUpsert).reduce(
    (acc, curr) => acc + curr.elapsedTime,
    0,
  );

  timeSpentOnDay = timeSpentToday;

  const timeSpentPerLanguageToday = Object.entries(filesDataToUpsert).reduce(
    (acc, [, { elapsedTime, languageSlug }]) => {
      acc[languageSlug] = (acc[languageSlug] || 0) + elapsedTime;
      return acc;
    },
    {} as { [languageSlug: string]: number },
  );

  const timeSpentPerProject = Object.entries(filesDataToUpsert)
    .map(([, fileData]) => ({
      project: fileData.projectPath,
      timeSpent: fileData.elapsedTime,
    }))
    .reduce(
      (acc, curr) => {
        if (acc[curr.project]) {
          acc[curr.project] += curr.timeSpent;
        } else {
          acc[curr.project] = curr.timeSpent;
        }
        return acc;
      },
      {} as Record<string, number>,
    );
  const todayFilesData = Object.fromEntries(
    Object.entries(filesDataToUpsert).map(
      ([
        filePath,
        { elapsedTime, languageSlug, projectName, projectPath, fileName },
      ]) => [
        filePath,
        {
          timeSpent: elapsedTime,
          languageSlug,
          projectName,
          projectPath,
          fileName,
        },
      ],
    ),
  );

  try {
    const globalStateData = await getGlobalStateData();

    // send the languages data to the server
    for (const [dateString, data] of Object.entries(
      globalStateData.dailyData,
    )) {
      // we send the data of older dates if found
      if (!isEqual(new Date(dateString), new Date(todaysDateString))) {
        await trpc.extension.upsertLanguages.mutate({
          targetedDate: dateString,
          timeSpentOnDay: data.timeSpentOnDay,
          timeSpentPerLanguage: data.timeSpentPerLanguage,
        });

        const perProject = Object.values(data.dayFilesData).reduce(
          (acc, { projectPath, timeSpent }) => {
            acc[projectPath] = (acc[projectPath] || 0) + timeSpent;
            return acc;
          },
          {} as Record<string, number>,
        );
        await trpc.extension.upsertFiles.mutate({
          filesData: data.dayFilesData,
          targetedDate: dateString,
          timeSpentPerProject: perProject,
        });
      }
    }

    const upsertedLanguagesData = await trpc.extension.upsertLanguages.mutate({
      targetedDate: todaysDateString,
      timeSpentOnDay: timeSpentToday,
      timeSpentPerLanguage: timeSpentPerLanguageToday,
    });

    timeSpentOnDay = upsertedLanguagesData.timeSpentOnDay;

    const files = await trpc.extension.upsertFiles.mutate({
      filesData: todayFilesData,
      targetedDate: todaysDateString,
      timeSpentPerProject,
    });
    updateFilesDataAfterSync(files);

    isServerSynced = true;
    lastServerSync = new Date();

    // ! Remove all the data (in the global state) for days previous to today if they exist
    // ! They do exist if the user stays offline and we change day

    await updateGlobalStateData({
      lastServerSync,
      dailyData: {
        [todaysDateString]: {
          timeSpentOnDay: timeSpentToday,
          timeSpentPerLanguage: timeSpentPerLanguageToday,
          dayFilesData: todayFilesData,
          updatedAt: new Date(),
        },
      },
    });
  } catch (error) {
    if (error instanceof TRPCClientError) {
      logError(
        `tRPC Error during sync: ${error.message}, Cause: ${error.cause}.`,
      );
    } else {
      vscode.window.showWarningMessage(
        `Unknown error during server sync: ${error}.`,
      );
    }
  } finally {
    try {
      // save the languages data in the vscode global state

      const globalStateData = await getGlobalStateData();

      await updateGlobalStateData({
        lastServerSync: isServerSynced
          ? lastServerSync
          : globalStateData.lastServerSync,
        dailyData: {
          ...globalStateData.dailyData,
          [todaysDateString]: {
            timeSpentOnDay: timeSpentToday,
            timeSpentPerLanguage: timeSpentPerLanguageToday,
            dayFilesData: todayFilesData,
            updatedAt: new Date(),
          },
        },
      });
    } catch (globalStateError) {
      vscode.window.showErrorMessage(
        `CRITICAL ERROR: Failed to save data to globalState : ${globalStateError}. Please open an issue to the GitHub repo of MoonCode.`,
      );
    }

    const isLoggedIn = getLoginContext();

    if (isLoggedIn) {
      setStatusBarItem({
        type: "time",
        timeSpentToday: timeSpentOnDay,
      });
    }
  }
};

export default periodicSyncData;
