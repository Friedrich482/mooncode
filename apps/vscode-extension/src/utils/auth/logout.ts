import vscode from "vscode";

import { getExtensionContext } from "@/extension";
import updateGlobalStateData from "@/utils/global-state/updateGlobalStateData";
import getTodaysLocalDate from "@repo/common/getTodaysLocalDate";

import deleteFilesDataContent from "../files/deleteFilesDataContent";
import setStatusBarItem from "../status-bar/setStatusBarItem";
import deleteToken from "./deleteToken";
import login from "./login";
import { setLoginContext } from "./loginContext";

const logout = async () => {
  try {
    const context = getExtensionContext();

    await deleteToken(context);

    await setLoginContext(false);
    setStatusBarItem({ type: "auth" });

    //  purge the local data of the current user

    deleteFilesDataContent();

    const todaysDateString = getTodaysLocalDate();
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
export default logout;
