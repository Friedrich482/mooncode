import { filesData } from "@/constants";
import { FileDataSync } from "@/types-schemas";

export const initializeFiles = (data: FileDataSync) => {
  // initialize the time/other metadata for each file found
  Object.keys(data).forEach((filePath) => {
    const file = data[filePath];
    const now = performance.now();

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
