import vscode from "vscode";

import { getExtensionContext, getStatusBarItem } from "@/extension";
import { FileDataSync } from "@/types-schemas";

import { login } from "../auth/login";
import { logout } from "../auth/logout";
import { openDashboard } from "../dashboard/open-dashboard";
import { getGlobalStateData } from "../global-state/get-global-state-data";
import { logInfo } from "../logger/logger";
import { calculateTime } from "../time/calculate-time";

export const initExtensionCommands = (
  getTime: Awaited<ReturnType<typeof calculateTime>>,
  initialFilesData: FileDataSync,
) => {
  const context = getExtensionContext();

  const showCurrentLanguagesDataCommand = vscode.commands.registerCommand(
    "MoonCode.showCurrentLanguagesData",
    () => {
      const filesData = getTime();

      const data = Object.entries(filesData)
        .flatMap(([projectPath, branches]) =>
          Object.entries(branches).flatMap(([branchName, files]) =>
            Object.entries(files).map(([filePath, file]) => ({
              projectPath,
              branchName,
              filePath,
              ...file,
            })),
          ),
        )
        .reduce(
          (acc, curr) => {
            acc[curr.languageSlug] =
              (acc[curr.languageSlug] ?? 0) + curr.elapsedTime;

            return acc;
          },
          {} as Record<string, number>,
        );

      const formattedData = Object.entries(data)
        .map(
          ([languageSlug, elapsedTime]) =>
            `${languageSlug}: ${elapsedTime} seconds`,
        )
        .join("\n");

      logInfo(`Current Languages Data:\n${formattedData}`);
    },
  );

  const showInitialLanguagesDataCommand = vscode.commands.registerCommand(
    "MoonCode.showInitialLanguagesData",
    () => {
      const data = Object.entries(initialFilesData)
        .flatMap(([projectPath, branches]) =>
          Object.entries(branches).flatMap(([branchName, files]) =>
            Object.entries(files).map(([filePath, file]) => ({
              projectPath,
              branchName,
              filePath,
              ...file,
            })),
          ),
        )
        .reduce(
          (acc, curr) => {
            acc[curr.languageSlug] =
              (acc[curr.languageSlug] ?? 0) + curr.timeSpent;

            return acc;
          },
          {} as Record<string, number>,
        );

      const formattedData = Object.entries(data)
        .map(
          ([languageSlug, elapsedTime]) =>
            `${languageSlug}: ${elapsedTime} seconds`,
        )
        .join("\n");

      logInfo(`Initial Languages Data:\n${formattedData}`);
    },
  );

  const showCurrentFilesDataCommand = vscode.commands.registerCommand(
    "MoonCode.showCurrentFilesData",
    () => {
      const filesData = getTime();

      const data = Object.entries(filesData).flatMap(
        ([projectPath, branches]) =>
          Object.entries(branches).flatMap(([branchName, files]) =>
            Object.entries(files).map(([filePath, file]) => ({
              projectPath,
              branchName,
              filePath,
              ...file,
            })),
          ),
      );

      const formattedData = data
        .map(
          ({ filePath, elapsedTime }) => `${filePath}: ${elapsedTime} seconds`,
        )
        .join("\n");
      logInfo(`Current files data:\n${formattedData}`);
    },
  );

  const showRawFilesDataCommand = vscode.commands.registerCommand(
    "MoonCode.showRawFilesDataCommand",
    () => {
      const filesData = getTime();
      logInfo(
        `Raw files Data computed:\n${JSON.stringify(filesData, null, 2)}`,
      );
    },
  );

  const showInitialFilesDataCommand = vscode.commands.registerCommand(
    "MoonCode.showInitialFilesData",
    () => {
      const data = Object.entries(initialFilesData).flatMap(
        ([projectPath, branches]) =>
          Object.entries(branches).flatMap(([branchName, files]) =>
            Object.entries(files).map(([filePath, file]) => ({
              projectPath,
              branchName,
              filePath,
              ...file,
            })),
          ),
      );

      const formattedData = Object.entries(data)
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
      logInfo(`Global State data: ${JSON.stringify(data, null, 2)}`);
    },
  );

  const loginCommand = vscode.commands.registerCommand("MoonCode.login", login);

  const logoutCommand = vscode.commands.registerCommand(
    "MoonCode.logout",
    logout,
  );

  const openDashboardCommand = vscode.commands.registerCommand(
    "MoonCode.openDashboard",
    openDashboard,
  );

  const statusBarItem = getStatusBarItem();

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
