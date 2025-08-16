import * as path from "path";
import * as vscode from "vscode";
import { DASHBOARD_PORT } from "@repo/common/constants";
import express from "express";
import getPort from "get-port";
import { logInfo } from "../logger/logger";

const serveDashboard = async (context: vscode.ExtensionContext) => {
  const app = express();
  const pathToFrontendDist = path.join(context.extensionPath, "_dashboard");

  if (!require("fs").existsSync(pathToFrontendDist)) {
    vscode.window.showErrorMessage(
      `Dashboard frontend not found at: ${pathToFrontendDist}`,
    );
    return;
  }

  app.use(express.static(pathToFrontendDist));
  app.get("*", (_, res) => {
    res.sendFile(path.join(pathToFrontendDist, "index.html"));
  });

  try {
    const availablePort = await getPort({
      port: Array.from({ length: 6 }, (_, i) => DASHBOARD_PORT + i),
    });

    const server = app
      .listen(availablePort, () => {
        logInfo(`Dashboard server started on localhost ${availablePort}`);
      })
      .on("error", (error) => {
        vscode.window.showErrorMessage(
          `Failed to start dashboard server: ${error.message}`,
        );
      });

    context.subscriptions.push({
      dispose: () => {
        server.close();
      },
    });

    return availablePort;
  } catch {
    vscode.window.showErrorMessage(
      `Could not find an available port between ${DASHBOARD_PORT} and ${DASHBOARD_PORT + 5}`,
    );

    return undefined;
  }
};

export default serveDashboard;
