import vscode from "vscode";

let isLoggedIn = false;

const setLoginContext = async (state: boolean) => {
  isLoggedIn = state;
  await vscode.commands.executeCommand(
    "setContext",
    "MoonCode.isLoggedIn",
    state,
  );
};

const getLoginContext = () => {
  return isLoggedIn;
};

export { getLoginContext, setLoginContext };
