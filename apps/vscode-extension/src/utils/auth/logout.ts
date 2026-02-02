import vscode from "vscode";

import { getExtensionContext } from "@/extension";
import { updateGlobalStateData } from "@/utils/global-state/update-global-state-data";
import { getTodaysLocaleDate } from "@repo/common/get-todays-locale-date";

import { deleteFilesDataContent } from "../files/delete-files-data-content";
import { setLogoutContextAndStatusBar } from "../status-bar/set-logout-context-and-status-bar";
import { deleteToken } from "./delete-token";
import { login } from "./login";

export const logout = async () => {
  try {
    const context = getExtensionContext();

    await deleteToken(context);

    await setLogoutContextAndStatusBar();

    //  purge the local data of the current user

    deleteFilesDataContent();

    const todaysDateString = getTodaysLocaleDate();
    await updateGlobalStateData({
      lastServerSync: new Date(),
      dailyData: {
        [todaysDateString]: {
          timeSpentOnDay: 0,
          timeSpentPerLanguage: {},
          dayFilesData: {},
          updatedAt: new Date(),
        },
      },
    });
  } catch (error) {
    vscode.window.showErrorMessage(
      `Logout failed: ${error instanceof Error ? error.message : error}`,
    );
    return;
  }

  const selection = await vscode.window.showInformationMessage(
    "Logged out",
    "Login",
    "Cancel",
  );

  if (selection === "Login") {
    await login();
  } else {
    return;
  }
};
