import vscode from "vscode";

import { getExtensionContext } from "@/extension";

import { setLoginContextAndStatusBar } from "../status-bar/set-login-context-and-status-bar";
import { storeJWTToken } from "./store-jwt-token";

export const registerAuthUriHandler = () => {
  const context = getExtensionContext();

  vscode.window.registerUriHandler({
    async handleUri(uri: vscode.Uri) {
      if (uri.path === "/auth-callback") {
        const params = new URLSearchParams(uri.query);
        const token = params.get("token");
        const receivedState = params.get("state");
        const email = decodeURIComponent(params.get("email") ?? "");

        const expectedState = await context.secrets.get("authState");

        if (
          !receivedState ||
          !expectedState ||
          receivedState !== expectedState
        ) {
          vscode.window.showErrorMessage(
            "Login Failed: auth state missing or incorrect",
          );
          await context.secrets.delete("authState");
          return;
        }

        if (token) {
          await storeJWTToken(context, token);
          await context.secrets.delete("authState");

          await setLoginContextAndStatusBar();

          vscode.window.showInformationMessage(
            `Logged in ${email ? `as ${email}` : "successfully"}`,
          );
        } else {
          vscode.window.showErrorMessage("Login failed: No token received.");
        }
      }
    },
  });
};
