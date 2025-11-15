import vscode from "vscode";

import calculateTime from "@/utils/time/calculateTime";

import registerAuthUriHandler from "./utils/auth/registerAuthUriHandler";
import initExtensionCommands from "./utils/commands/initExtensionCommands";
import serveDashboard from "./utils/dashboard/serveDashboard";
import setEnvironmentContext from "./utils/env/setEnvironmentContext";
import fetchInitialData from "./utils/fetchInitialData";
import initializeFiles from "./utils/files/initializeFiles";
import { logInfo } from "./utils/logger/logger";
import periodicSyncData from "./utils/periodicSyncData";
import addStatusBarItem from "./utils/status-bar/addStatusBarItem";
import setStatusBarItem from "./utils/status-bar/setStatusBarItem";

let extensionContext: vscode.ExtensionContext;
let dashboardPort: number | undefined;
let statusBarItem: vscode.StatusBarItem;

export async function activate(context: vscode.ExtensionContext) {
  extensionContext = context;

  setEnvironmentContext();
  dashboardPort = await serveDashboard(context);
  registerAuthUriHandler();

  statusBarItem = addStatusBarItem();

  const { timeSpent, initialFilesData } = await fetchInitialData();

  setStatusBarItem({ type: "time", timeSpentToday: timeSpent });

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

export const getDashboardPort = () => {
  if (!dashboardPort) {
    throw new Error(
      "Failed to start the extension. Dashboard could not be served."
    );
  }
  return dashboardPort;
};

export const getStatusBarItem = () => {
  if (!statusBarItem) {
    throw new Error("Failed to add the item to the status bar");
  }
  return statusBarItem;
};
