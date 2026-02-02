import vscode from "vscode";

let isLoggedIn = false;

export const setLoginContext = async (state: boolean) => {
  isLoggedIn = state;
  await vscode.commands.executeCommand(
    "setContext",
    "MoonCode.isLoggedIn",
    state,
  );
};

export const getLoginContext = () => {
  return isLoggedIn;
};
