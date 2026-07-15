import { filesData } from "@/constants";
import { FileDataSync } from "@/types-schemas";

export const initializeFiles = (data: FileDataSync) => {
  const now = performance.now();

  // initialize the time and other metadata for each file found
  Object.entries(data).forEach(([projectPath, branches]) => {
    Object.entries(branches).forEach(([branchName, files]) => {
      Object.entries(files).forEach(([filePath, file]) => {
        filesData[projectPath] ??= {};
        filesData[projectPath][branchName] ??= {};

        filesData[projectPath][branchName][filePath] = {
          elapsedTime: file.timeSpent,
          frozenTime: null,
          freezeStartTime: null,
          isFrozen: false,
          lastActivityTime: now,
          startTime: now - file.timeSpent * 1000,
          projectName: file.projectName,
          languageSlug: file.languageSlug,
          fileName: file.fileName,
        };
      });
    });
  });
};
