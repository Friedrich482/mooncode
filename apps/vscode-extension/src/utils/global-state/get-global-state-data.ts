import vscode from "vscode";
import { ZodError } from "zod";

import { SYNC_DATA_KEY } from "@/constants";
import { getExtensionContext } from "@/extension";
import { GlobalStateData, globalStateInitialDataSchema } from "@/types-schemas";
import { formatZodError } from "@repo/common/format-zod-error";
import { getLocaleDate } from "@repo/common/get-locale-date";

/**
 * This function is a wrapper around the raw `vscode.context.globalState.get(key)`
 * Don't call `vscode.context.globalState.get(key)` directly to retrieve the global state data, only use this function
 * @returns `Promise<GlobalStateData>`
 */

export const getGlobalStateData: () => Promise<GlobalStateData> = async () => {
  const context = getExtensionContext();
  const todaysDateString = getLocaleDate(new Date());

  try {
    const globalStateData = globalStateInitialDataSchema.parse(
      await context.globalState.get(SYNC_DATA_KEY),
    );

    return globalStateData;
  } catch (error) {
    vscode.window.showErrorMessage(
      `Invalid data shape: ${error instanceof ZodError ? formatZodError(error) : error}. Defaulting to default data`,
    );

    return {
      lastServerSync: new Date(),
      dailyData: {
        [todaysDateString]: {
          timeSpentOnDay: 0,
          timeSpentPerLanguage: {},
          dayFilesData: {},
          updatedAt: new Date(),
        },
      },
    };
  }
};
