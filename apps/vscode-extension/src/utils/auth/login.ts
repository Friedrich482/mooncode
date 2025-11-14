import crypto from "crypto";
import * as vscode from "vscode";

import { getDashboardPort, getExtensionContext } from "@/extension";

const login = async () => {
  const context = getExtensionContext();
  const dashboardPort = getDashboardPort();

  try {
    let state = await context.secrets.get("authState");

    if (!state) {
      state = crypto.randomBytes(32).toString("base64url");
      await context.secrets.store("authState", state);
    }

    const publisher = context.extension.id.split(".")[0];
    const extensionId = context.extension.id.split(".")[1];

    const callbackUri = await vscode.env.asExternalUri(
      vscode.Uri.parse(
        `vscode://${publisher}.${extensionId}/auth-callback?state=${state}`
      )
    );

    const dashboardLoginUrl = vscode.Uri.parse(
      `http://localhost:${dashboardPort}/login?client=vscode&callback=${encodeURIComponent(callbackUri.toString())}`
    );

    const selection = await vscode.window.showInformationMessage(
      "Open the local dashboard to login",
      "Open Dashboard"
    );

    if (!selection) {
      return;
    }

    if (selection === "Open Dashboard") {
      vscode.env.openExternal(dashboardLoginUrl);
    }
  } catch (error) {
    vscode.window.showErrorMessage(
      `An error occurred: ${error instanceof Error ? error.message : error}`
    );
  }
};

export default login;
