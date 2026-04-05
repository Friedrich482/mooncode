import vscode from "vscode";

import { DashboardServer } from "./types-schemas";
import { getLoginContext } from "./utils/auth/login-context";
import { registerAuthUriHandler } from "./utils/auth/register-auth-uri-handler";
import { initExtensionCommands } from "./utils/commands/init-extension-commands";
import { serveDashboard } from "./utils/dashboard/serve-dashboard/serve-dashboard";
import { setEnvironmentContext } from "./utils/env/set-environment-context";
import { fetchInitialData } from "./utils/fetch-initial-data";
import { initializeFiles } from "./utils/files/initialize-files";
import { logInfo } from "./utils/logger/logger";
import { periodicSyncData } from "./utils/periodic-sync-data";
import { addStatusBarItem } from "./utils/status-bar/add-status-bar-item";
import { setStatusBarItem } from "./utils/status-bar/set-status-bar-item";
import { calculateTime } from "./utils/time/calculate-time";

let extensionContext: vscode.ExtensionContext;
let dashboardServer: DashboardServer | undefined;
let statusBarItem: vscode.StatusBarItem;

export async function activate(context: vscode.ExtensionContext) {
  extensionContext = context;

  setEnvironmentContext();
  dashboardServer = await serveDashboard();
  registerAuthUriHandler();

  statusBarItem = addStatusBarItem();

  const { timeSpent, initialFilesData } = await fetchInitialData();

  const isLoggedIn = getLoginContext();
  if (isLoggedIn) {
    setStatusBarItem({ type: "time", timeSpentToday: timeSpent });
  }

  initializeFiles(initialFilesData);

  const getTime = await calculateTime();

  const periodicSyncDataInterval = setInterval(async () => {
    await periodicSyncData(getTime);
  }, 60000);

  initExtensionCommands(getTime, initialFilesData);

  context.subscriptions.push({
    dispose: () => {
      clearInterval(periodicSyncDataInterval);
    },
  });
}

export async function deactivate() {
  logInfo("MoonCode deactivated");
}

export const getExtensionContext = () => {
  if (!extensionContext) {
    throw new Error("Extension context has not been initialized.");
  }
  return extensionContext;
};

export const getDashboardServer = () => {
  if (!dashboardServer) {
    throw new Error(
      "Failed to start the extension. Dashboard could not be served.",
    );
  }
  return dashboardServer;
};

export const getStatusBarItem = () => {
  if (!statusBarItem) {
    throw new Error("Failed to add the item to the status bar");
  }
  return statusBarItem;
};
