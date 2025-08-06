import * as vscode from "vscode";
import { z } from "zod";

const storeJWTToken = async (
  context: vscode.ExtensionContext,
  token: string,
) => {
  try {
    const verifiedToken = z.jwt().parse(token);
    await context.secrets.store("authToken", verifiedToken);
  } catch (error) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(
        `Error while storing the authentication token: ${error.message}.`,
      );
    } else {
      vscode.window.showErrorMessage(
        `Error while storing the authentication token: ${error}.`,
      );
    }
  }
};

export default storeJWTToken;
