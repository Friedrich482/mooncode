import { isEqual } from "date-fns";
import * as vscode from "vscode";

import { getLocaleDate } from "@repo/common/get-locale-date";
import { TRPCClientError } from "@trpc/client";

import { getLoginContext } from "./auth/login-context";
import { updateFilesDataAfterSync } from "./files/update-files-data-after-sync";
import { getGlobalStateData } from "./global-state/get-global-state-data";
import { updateGlobalStateData } from "./global-state/update-global-state-data";
import { logError } from "./logger/logger";
import { setStatusBarItem } from "./status-bar/set-status-bar-item";
import { calculateTime } from "./time/calculate-time";
import { trpc } from "./trpc/client";

export const periodicSyncData = async (
  getTime: Awaited<ReturnType<typeof calculateTime>>,
) => {
  const todaysDateString = getLocaleDate(new Date());
  let lastServerSync = new Date();
  let isServerSynced = false;
  let timeSpentOnDay = 0;
  let timeSpentPerLanguage: {
    [languageSlug: string]: number;
  };

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

  timeSpentPerLanguage = timeSpentPerLanguageToday;

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
      ([filePath, { elapsedTime, ...rest }]) => [
        filePath,
        {
          timeSpent: elapsedTime,
          ...rest,
        },
      ],
    ),
  );

  const globalStateData = await getGlobalStateData();

  try {
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
    timeSpentPerLanguage = upsertedLanguagesData.languages;

    const files = await trpc.extension.upsertFiles.mutate({
      filesData: todayFilesData,
      targetedDate: todaysDateString,
      timeSpentPerProject,
    });
    updateFilesDataAfterSync(files);

    isServerSynced = true;
    lastServerSync = new Date();

    // Remove all the data for days previous to today - they've been synced
    await updateGlobalStateData({
      lastServerSync,
      dailyData: {
        [todaysDateString]: {
          timeSpentOnDay,
          timeSpentPerLanguage,
          dayFilesData: files,
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
      // If server sync failed, preserve old data; otherwise only keep today
      if (!isServerSynced) {
        await updateGlobalStateData({
          lastServerSync: globalStateData.lastServerSync,
          dailyData: {
            ...globalStateData.dailyData,
            [todaysDateString]: {
              timeSpentOnDay,
              timeSpentPerLanguage,
              dayFilesData: todayFilesData,
              updatedAt: new Date(),
            },
          },
        });
      }
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
