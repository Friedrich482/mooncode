import * as vscode from "vscode";
import { logDir, logInfo } from "../logger/logger";
import { FileDataSync } from "@/types-schemas";
import calculateTime from "../time/calculateTime";
import { getExtensionContext } from "@/extension";
import getGlobalStateData from "../global-state/getGlobalStateData";
import login from "../auth/login";
import logout from "../auth/logout";
import openDashboard from "../dashboard/openDashboard";

const initExtensionCommands = (
  getTime: Awaited<ReturnType<typeof calculateTime>>,
  initialFilesData: FileDataSync,
  statusBarItem: vscode.StatusBarItem,
) => {
  const context = getExtensionContext();

  const showCurrentLanguagesDataCommand = vscode.commands.registerCommand(
    "MoonCode.showCurrentLanguagesData",
    () => {
      const filesData = getTime();

      const formattedData = Object.entries(
        Object.entries(filesData).reduce(
          (acc, [, { elapsedTime, languageSlug }]) => {
            acc[languageSlug] = (acc[languageSlug] || 0) + elapsedTime;
            return acc;
          },
          {} as Record<string, number>,
        ),
      )
        .map(([key, elapsedTime]) => `${key}: ${elapsedTime} seconds`)
        .join("\n");
      logInfo(`Current Languages Data:\n${formattedData}`);
    },
  );

  const showInitialLanguagesDataCommand = vscode.commands.registerCommand(
    "MoonCode.showInitialLanguagesData",
    () => {
      const formattedData = Object.entries(
        Object.entries(initialFilesData).reduce(
          (acc, [, { timeSpent, languageSlug }]) => {
            acc[languageSlug] = (acc[languageSlug] || 0) + timeSpent;
            return acc;
          },
          {} as Record<string, number>,
        ),
      )
        .map(([key, elapsedTime]) => `${key}: ${elapsedTime} seconds`)
        .join("\n");
      logInfo(`Initial Languages Data:\n${formattedData}`);
    },
  );

  const showCurrentFilesDataCommand = vscode.commands.registerCommand(
    "MoonCode.showCurrentFilesData",
    () => {
      const filesData = getTime();
      const formattedData = Object.entries(filesData)
        .map(([key, { elapsedTime }]) => `${key}: ${elapsedTime} seconds`)
        .join("\n");
      logInfo(`Current files data:\n${formattedData}`);
    },
  );
  /**
   * *debugging* in prod purposes...
   */
  const showRawFilesDataCommand = vscode.commands.registerCommand(
    "MoonCode.showRawFilesDataCommand",
    () => {
      const filesData = getTime();
      const formattedData = Object.entries(filesData)
        .map(([key, fileData]) => `${key}:${JSON.stringify(fileData, null, 2)}`)
        .join("\n");
      logInfo(`Raw files Data computed:\n${formattedData}`);
    },
  );

  const showInitialFilesDataCommand = vscode.commands.registerCommand(
    "MoonCode.showInitialFilesData",
    () => {
      const formattedData = Object.entries(initialFilesData)
        .map(
          ([key, { timeSpent: elapsedTime }]) =>
            `${key}: ${elapsedTime} seconds`,
        )
        .join("\n");
      logInfo(`InitialFilesData:\n${formattedData}`);
    },
  );

  const showGlobalStateContentCommand = vscode.commands.registerCommand(
    "MoonCode.showGlobalStateData",
    async () => {
      const data = await getGlobalStateData();
      logDir(data);
    },
  );

  const loginCommand = vscode.commands.registerCommand(
    "MoonCode.login",
    async () => {
      await login();
    },
  );

  const logoutCommand = vscode.commands.registerCommand(
    "MoonCode.logout",
    logout,
  );

  const openDashboardCommand = vscode.commands.registerCommand(
    "MoonCode.openDashboard",
    openDashboard,
  );

  context.subscriptions.push(
    showInitialLanguagesDataCommand,
    showCurrentLanguagesDataCommand,
    showInitialFilesDataCommand,
    showCurrentFilesDataCommand,
    showRawFilesDataCommand,
    showGlobalStateContentCommand,
    loginCommand,
    logoutCommand,
    openDashboardCommand,
    statusBarItem,
  );
};

export default initExtensionCommands;
