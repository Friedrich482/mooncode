import * as vscode from "vscode";
import { GlobalStateData, globalStateInitialDataSchema } from "@/types-schemas";
import { SYNC_DATA_KEY } from "@/constants";
import { ZodError } from "zod";
import { formatZodError } from "@repo/common/formatZodError";
import { getExtensionContext } from "@/extension";
import getTodaysLocalDate from "@repo/common/getTodaysLocalDate";

const getGlobalStateData: () => Promise<GlobalStateData> = async () => {
  const context = getExtensionContext();
  const todaysDateString = getTodaysLocalDate();

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

export default getGlobalStateData;
