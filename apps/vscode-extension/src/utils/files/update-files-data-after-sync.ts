import { filesData } from "@/constants";
import { FileDataSync } from "@/types-schemas";

export const updateFilesDataAfterSync = (filesFromServer: FileDataSync) => {
  const now = performance.now();

  Object.entries(filesFromServer).forEach(([projectPath, branches]) => {
    Object.entries(branches).forEach(([branchName, files]) => {
      Object.entries(files).forEach(([filePath, file]) => {
        filesData[projectPath] ??= {};
        filesData[projectPath][branchName] ??= {};

        let entry = filesData[projectPath][branchName][filePath];

        if (entry) {
          entry.elapsedTime = file.timeSpent;

          if (!entry.isFrozen) {
            entry.startTime = now - file.timeSpent * 1000;
            return;
          }

          entry.frozenTime = file.timeSpent;
          return;
        }

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
