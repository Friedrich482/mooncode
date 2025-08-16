import addStatusBarItem from "./utils/status-bar/addStatusBarItem";
import calculateTime from "@/utils/time/calculateTime";
import fetchInitialData from "./utils/fetchInitialData";
import initExtensionCommands from "./utils/commands/initExtensionCommands";
import initializeFiles from "./utils/files/initializeFiles";
import { logInfo } from "./utils/logger/logger";
import periodicSyncData from "./utils/periodicSyncData";
import registerAuthUriHandler from "./utils/auth/registerAuthUriHandler";
import serveDashboard from "./utils/dashboard/serveDashboard";
import setEnvironmentContext from "./utils/env/setEnvironmentContext";
import setStatusBarItem from "./utils/status-bar/setStatusBarItem";
import vscode from "vscode";

let extensionContext: vscode.ExtensionContext;
let dashboardPort: number | undefined;

export async function activate(context: vscode.ExtensionContext) {
  extensionContext = context;

  setEnvironmentContext();
  dashboardPort = await serveDashboard(context);
  registerAuthUriHandler();

  vscode.window.showInformationMessage(
    "MoonCode starts now tracking your coding time",
  );

  const statusBarItem = addStatusBarItem();

  const { timeSpent, initialFilesData } = await fetchInitialData();

  setStatusBarItem(timeSpent, statusBarItem);

  initializeFiles(initialFilesData);

  const getTime = await calculateTime();

  const periodicSyncDataInterval = setInterval(async () => {
    await periodicSyncData(statusBarItem, getTime);
  }, 60000);

  initExtensionCommands(getTime, initialFilesData, statusBarItem);

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
      "Failed to start the extension. Dashboard could not be served.",
    );
  }
  return dashboardPort;
};
