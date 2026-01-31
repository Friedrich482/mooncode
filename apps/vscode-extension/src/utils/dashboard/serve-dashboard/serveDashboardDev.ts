import getPort from "get-port";
import * as vscode from "vscode";
import { WebSocket, WebSocketServer } from "ws";

import { DashboardServer } from "@/types-schemas";
import { logDir, logError, logInfo } from "@/utils/logger/logger";
import {
  DASHBOARD_DEVELOPMENT_PORT,
  DASHBOARD_DEVELOPMENT_URL,
  DASHBOARD_DEVELOPMENT_WS_PORT,
} from "@repo/common/constants";
import { WsData, WsDataSchema } from "@repo/common/types-schemas";

const serveDashboardDev = async (context: vscode.ExtensionContext) => {
  const wsPort = await getPort({ port: DASHBOARD_DEVELOPMENT_WS_PORT });

  const wss = new WebSocketServer({ port: wsPort });
  let activeConnection: WebSocket | null = null;

  wss.on("connection", (ws) => {
    logInfo("Dashboard window connected");

    if (activeConnection && activeConnection.readyState === WebSocket.OPEN) {
      logInfo("Closing previous dashboard connection");
      activeConnection.close();
    }

    activeConnection = ws;

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        const validated = WsDataSchema.safeParse(data);
        if (!validated.success) {
          console.error("Invalid message shape");
          return;
        }

        logInfo("Received from dashboard:");
        logDir(validated.data);

        const { type } = validated.data;

        if (type === "ready") {
          logInfo("Dashboard is ready");
        } else if (type === "navigated") {
          const { path } = validated.data;
          logInfo(`Dashboard navigated to: ${path}`);
        }
      } catch (error) {
        logError(`Failed to parse WebSocket message: ${error}`);
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

  const dashboardServer = {
    port: DASHBOARD_DEVELOPMENT_PORT,

    navigate: (path: string) => {
      // if there is already a window open, navigate
      if (activeConnection && activeConnection.readyState === WebSocket.OPEN) {
        activeConnection.send(
          JSON.stringify({
            type: "navigate",
            path,
          } satisfies WsData),
        );
        logInfo(`Sent navigate command to dashboard: ${path}`);
      } else {
        // open a new window
        const url = `${DASHBOARD_DEVELOPMENT_URL}${path}`;
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
    },
  } satisfies DashboardServer;

  context.subscriptions.push({
    dispose: () => {
      dashboardServer.close();
    },
  });

  return dashboardServer;
};

export default serveDashboardDev;
