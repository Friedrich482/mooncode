import vscode from "vscode";
import { z } from "zod";

import { getExtensionContext } from "@/extension";

export const storeJwtToken = async (token: string) => {
  const context = getExtensionContext();

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
