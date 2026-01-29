import express from "express";
import getPort from "get-port";
import * as http from "http";
import * as path from "path";
import * as vscode from "vscode";
import { WebSocket, WebSocketServer } from "ws";

import { DashboardServer } from "@/types-schemas";
import { logDir, logError, logInfo } from "@/utils/logger/logger";
import { DASHBOARD_PRODUCTION_PORT } from "@repo/common/constants";

const serveDashboardProd = async (context: vscode.ExtensionContext) => {
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

  const availablePort = await getPort({
    port: Array.from({ length: 6 }, (_, i) => DASHBOARD_PRODUCTION_PORT + i),
  });

  const httpServer = http.createServer(app);

  const wss = new WebSocketServer({ server: httpServer });
  let activeConnection: WebSocket | null = null;

  wss.on("connection", (ws) => {
    logInfo("Dashboard window connected");
    activeConnection = ws;

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        logInfo("Received from dashboard:");
        logDir(data);

        if (data.type === "ready") {
          logInfo("Dashboard is ready");
        } else if (data.type === "navigated") {
          logInfo(`Dashboard navigated to: ${data.path}`);
        }
      } catch (error) {
        logError(`Error receiving message: ${error}`);
      }
    });

    ws.on("close", () => {
      logInfo("Dashboard window disconnected");
      if (activeConnection === ws) {
        activeConnection = null;
      }
    });

    ws.on("error", (error) => {
      logError(`WebSocket error: ${error}`);
    });
  });

  httpServer
    .listen(availablePort, () => {
      logInfo(`Dashboard server started on localhost ${availablePort}`);
    })
    .on("error", (error) => {
      vscode.window.showErrorMessage(
        `Failed to start dashboard server: ${error.message}`,
      );
    });

  const dashboardServer = {
    port: availablePort,

    navigate: (path: string) => {
      // if there is already a window open, navigate
      if (activeConnection && activeConnection.readyState === WebSocket.OPEN) {
        activeConnection.send(
          JSON.stringify({
            type: "navigate",
            path,
          }),
        );
        logInfo(`Sent navigate command to dashboard: ${path}`);
      } else {
        // open a new window
        const url = `http://localhost:${availablePort}${path}`;
        vscode.env.openExternal(vscode.Uri.parse(url));
      }
    },

    isWindowOpen: () =>
      activeConnection !== null &&
      activeConnection.readyState === WebSocket.OPEN,

    close: () => {
      if (activeConnection) {
        activeConnection.close();
      }
      wss.close();
      httpServer.close();
    },
  } satisfies DashboardServer;

  context.subscriptions.push({
    dispose: () => {
      dashboardServer.close();
    },
  });

  return dashboardServer;
};

export default serveDashboardProd;
