import { filesData } from "@/constants";

import { RouterOutput } from "../trpc/client";

export const updateFilesDataAfterSync = (
  files: Awaited<RouterOutput["extension"]["upsertFiles"]>,
) => {
  const now = performance.now();

  Object.keys(files).forEach((filePath) => {
    const file = files[filePath];

    if (filesData[filePath]) {
      filesData[filePath].elapsedTime = file.timeSpent;

      if (!filesData[filePath].isFrozen) {
        filesData[filePath].startTime = now - file.timeSpent * 1000;
        return;
      }

      filesData[filePath].frozenTime = file.timeSpent;
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
