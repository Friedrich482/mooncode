import * as vscode from "vscode";

import { getExtensionContext } from "@/extension";
import { FileMap } from "@/types-schemas";

import { updateCurrentFileObj } from "../files/update-current-file-obj";
import { updateFilesDataElapsedTime } from "../files/update-files-data-elapsed-time";
import { updateFilesDataFrozenStates } from "../files/update-files-data-frozen-states";
import { getGlobalStateData } from "../global-state/get-global-state-data";
import { logError } from "../logger/logger";
import { isNewDayHandler } from "./is-new-day-handler";

export const calculateTime = async (): Promise<() => FileMap> => {
  const context = getExtensionContext();
  const disposables = context.subscriptions;

  let { dailyData, lastServerSync } = await getGlobalStateData();

  let timeoutId: NodeJS.Timeout | undefined;

  const runPeriodicCheck = async () => {
    try {
      const maybeUpdated = await isNewDayHandler(dailyData, lastServerSync);

      if (maybeUpdated) {
        dailyData = maybeUpdated.dailyData;
        lastServerSync = maybeUpdated.lastServerSync;
      }

      updateFilesDataFrozenStates();
    } catch (error) {
      logError(`Error in periodic check:${error}`);
    } finally {
      timeoutId = setTimeout(runPeriodicCheck, 1000);
    }
  };

  timeoutId = setTimeout(runPeriodicCheck, 1000);

  disposables.push({
    dispose: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    },
  });

  const activityListeners = [
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        updateCurrentFileObj(editor.document);
      }
    }),

    vscode.workspace.onDidChangeTextDocument((event) => {
      if (
        vscode.window.activeTextEditor &&
        event.document === vscode.window.activeTextEditor.document
      ) {
        updateCurrentFileObj(event.document);
      }
    }),
  ];

  disposables.push(...activityListeners);

  const getTime = () => {
    return updateFilesDataElapsedTime();
  };

  return getTime;
};
