import * as vscode from "vscode";

import { filesData } from "@/constants";
import type { AppRouter } from "@repo/trpc/router";

import { getCurrentFileProperties } from "./get-current-file-properties";

export const updateFilesDataAfterSync = (
  files: Awaited<ReturnType<AppRouter["extension"]["upsertFiles"]>>,
) => {
  const now = performance.now();

  const currentFile = getCurrentFileProperties(
    vscode.window.activeTextEditor?.document,
  );

  Object.keys(files).forEach((filePath) => {
    const file = files[filePath];

    if (filesData[filePath]) {
      filesData[filePath].elapsedTime = file.timeSpent;

      if (currentFile && filePath === currentFile.absolutePath) {
        filesData[filePath].startTime = now - file.timeSpent * 1000;
      }

      return;
    }

    filesData[filePath] = {
      elapsedTime: file.timeSpent,
      frozenTime: null,
      freezeStartTime: null,
      isFrozen: false,
      lastActivityTime: now,
      startTime: now - file.timeSpent * 1000,
      projectName: file.projectName,
      projectPath: file.projectPath,
      languageSlug: file.languageSlug,
      fileName: file.fileName,
    };
  });
};
