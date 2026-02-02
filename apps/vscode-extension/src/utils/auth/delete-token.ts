import vscode from "vscode";

export const deleteToken = async (context: vscode.ExtensionContext) => {
  await context.secrets.delete("authToken");
};
