import { isEqual } from "date-fns";
import vscode from "vscode";

import { FileDataSync } from "@/types-schemas";
import { getLocaleDate } from "@repo/common/get-locale-date";

import { getLoginContext } from "./auth/login-context";
import { handleInvalidTokenError } from "./errors/handle-invalid-token-error";
import { hasFilesDataChanged } from "./files/has-files-data-changed";
import { updateFilesDataAfterSync } from "./files/update-files-data-after-sync";
import { getGlobalStateData } from "./global-state/get-global-state-data";
import { updateGlobalStateData } from "./global-state/update-global-state-data";
import { hasLanguagesDataChanged } from "./languages/has-languages-data-changed";
import { logError } from "./logger/logger";
import { setStatusBarItem } from "./status-bar/set-status-bar-item";
import { calculateTime } from "./time/calculate-time";
import { isTRPCClientError, trpc } from "./trpc/client";

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

  const rawData = getTime();

  const filesDataToUpsert = Object.entries(rawData).flatMap(
    ([projectPath, branches]) =>
      Object.entries(branches).flatMap(([branchName, files]) =>
        Object.entries(files).map(([filePath, file]) => ({
          projectPath,
          branchName,
          filePath,
          ...file,
        })),
      ),
  );

  const timeSpentToday = filesDataToUpsert.reduce(
    (acc, curr) => acc + curr.elapsedTime,
    0,
  );

  timeSpentOnDay = timeSpentToday;

  const timeSpentPerLanguageToday = Object.entries(filesDataToUpsert).reduce(
    (acc, [, { elapsedTime, languageSlug }]) => {
      acc[languageSlug] = (acc[languageSlug] ?? 0) + elapsedTime;
      return acc;
    },
    {} as { [languageSlug: string]: number },
  );

  timeSpentPerLanguage = timeSpentPerLanguageToday;

  const todayFilesData = Object.fromEntries(
    Object.entries(rawData).map(([projectPath, branches]) => [
      projectPath,
      Object.fromEntries(
        Object.entries(branches).map(([branchName, files]) => [
          branchName,
          Object.fromEntries(
            Object.entries(files).map(
              ([
                filePath,
                { elapsedTime, fileName, languageSlug, projectName },
              ]) => [
                filePath,
                {
                  projectPath,
                  branchName,
                  timeSpent: elapsedTime,
                  fileName,
                  languageSlug,
                  projectName,
                },
              ],
            ),
          ),
        ]),
      ),
    ]),
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

        await trpc.extension.upsertFiles.mutate({
          filesData: data.dayFilesData,
          targetedDate: dateString,
          type: "new",
        });
      }
    }

    const hasLanguagesDataChangedSinceLastSync = hasLanguagesDataChanged(
      globalStateData.dailyData[todaysDateString]?.timeSpentPerLanguage ?? {},
      timeSpentPerLanguageToday,
    );

    if (hasLanguagesDataChangedSinceLastSync) {
      const upsertedLanguagesData = await trpc.extension.upsertLanguages.mutate(
        {
          targetedDate: todaysDateString,
          timeSpentOnDay: timeSpentToday,
          timeSpentPerLanguage: timeSpentPerLanguageToday,
        },
      );

      timeSpentOnDay = upsertedLanguagesData.timeSpentOnDay;
      timeSpentPerLanguage = upsertedLanguagesData.languages;
    }

    const hasFilesDataChangedSinceLastSync = hasFilesDataChanged(
      globalStateData.dailyData[todaysDateString]?.dayFilesData ?? {},
      todayFilesData,
    );

    if (hasFilesDataChangedSinceLastSync) {
      const files = (await trpc.extension.upsertFiles.mutate({
        filesData: todayFilesData,
        targetedDate: todaysDateString,
        type: "new",
      })) as FileDataSync;

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
    }
  } catch (error) {
    if (isTRPCClientError(error)) {
      logError(
        `tRPC Error during sync: ${error.message}, Cause: ${error.cause}, Code: ${error.data?.code}.`,
      );
      await handleInvalidTokenError(error);
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
