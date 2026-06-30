import { randomBytes } from "crypto";
import vscode from "vscode";

import { getDashboardServer, getExtensionContext } from "@/extension";
import { EXTENSION_LOGIN_PATH } from "@repo/common/constants";

export const login = async () => {
  const context = getExtensionContext();
  const dashboardServer = getDashboardServer();

  try {
    let state = await context.secrets.get("authState");

    if (!state) {
      state = randomBytes(32).toString("base64url");
      await context.secrets.store("authState", state);
    }

    const [publisher, extensionId] = context.extension.id.split(".");

    const callbackUri = await vscode.env.asExternalUri(
      vscode.Uri.parse(
        `vscode://${publisher}.${extensionId}/${EXTENSION_LOGIN_PATH}?state=${state}`,
      ),
    );

    const dashboardLoginPath = `/login?client=vscode&callback=${encodeURIComponent(callbackUri.toString())}`;

    const selection = await vscode.window.showInformationMessage(
      "Open the local dashboard to login",
      "Open Dashboard",
    );

    if (!selection) {
      return;
    }

    if (selection === "Open Dashboard") {
      dashboardServer.navigate(dashboardLoginPath);
    }
  } catch (error) {
    vscode.window.showErrorMessage(
      `An error occurred: ${error instanceof Error ? error.message : error}`,
    );
  }
};
