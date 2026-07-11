import vscode from "vscode";

import { filesData, MAX_IDLE_TIME } from "@/constants";

import { getCurrentFileProperties } from "./get-current-file-properties";

export const updateFilesDataFrozenStates = () => {
  const latestFile = getCurrentFileProperties(
    vscode.window.activeTextEditor?.document,
  );

  const now = performance.now();

  Object.entries(filesData).forEach(([, branches]) => {
    Object.entries(branches).forEach(([branchName, files]) => {
      Object.entries(files).forEach(([filePath, file]) => {
        // immediately freeze non active files
        if (
          !latestFile ||
          !latestFile.absolutePath ||
          filePath !== latestFile.absolutePath ||
          branchName !== latestFile.branchName
        ) {
          if (!file.isFrozen) {
            file.freezeStartTime = now;
            file.isFrozen = true;
            file.frozenTime = Math.floor((now - file.startTime) / 1000);
          }
          return;
        }

        const latestFileObj = file;

        // We track the time elapsed since when the latest file has been modified
        // in a variable called `idleDuration`
        const idleDuration = Math.floor(
          (now - latestFileObj.lastActivityTime) / 1000,
        );

        // we freeze the time for the active file if the user is idling for more than `MAX_IDLE_TIME`
        if (idleDuration >= MAX_IDLE_TIME && !latestFileObj.isFrozen) {
          latestFileObj.frozenTime = Math.floor(
            (now - latestFileObj.startTime) / 1000,
          );
          latestFileObj.freezeStartTime = now;
          latestFileObj.isFrozen = true;
        } else if (
          // we unfreeze if it is active, marked as frozen and
          // if the user hasn't been idled for more than `MAX_IDLE_TIME` seconds
          idleDuration < MAX_IDLE_TIME &&
          latestFileObj.isFrozen &&
          latestFileObj.freezeStartTime
        ) {
          const freezeDuration = Math.floor(
            (now - latestFileObj.freezeStartTime) / 1000,
          );
          latestFileObj.startTime += Math.floor(freezeDuration * 1000);
          latestFileObj.frozenTime = null;
          latestFileObj.freezeStartTime = null;
          latestFileObj.isFrozen = false;
        }
      });
    });
  });
};
