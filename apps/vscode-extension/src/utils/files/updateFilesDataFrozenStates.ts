import { MAX_IDLE_TIME, filesData } from "@/constants";
import getCurrentFileProperties from "./getCurrentFileProperties";
import vscode from "vscode";

const updateFilesDataFrozenStates = () => {
  const latestFile = getCurrentFileProperties(
    vscode.window.activeTextEditor?.document,
  );

  const now = performance.now();

  Object.keys(filesData).forEach((file) => {
    const fileData = filesData[file];
    /**
     * immediately freeze non active files
     */
    if (!latestFile.absolutePath || file !== latestFile.absolutePath) {
      if (!fileData.isFrozen) {
        fileData.freezeStartTime = now;
        fileData.isFrozen = true;
        fileData.frozenTime = Math.floor((now - fileData.startTime) / 1000);
      }
      return;
    }

    const latestFileObj = filesData[latestFile.absolutePath];

    /**
     *  We track the time elapsed since when the latest file has been modified
     *  in a variable called `idleDuration`
     */
    const idleDuration = Math.floor(
      (now - latestFileObj.lastActivityTime) / 1000,
    );

    /**
     * we freeze the time for the active file if the user is idling for more than `MAX_IDLE_TIME`
     */
    if (idleDuration >= MAX_IDLE_TIME && !latestFileObj.isFrozen) {
      latestFileObj.frozenTime = Math.floor(
        (now - latestFileObj.startTime) / 1000,
      );
      latestFileObj.freezeStartTime = now;
      latestFileObj.isFrozen = true;
    } else if (
      /**
       * we unfreeze if it is active,
       * marked as frozen and if the user hasn't been idled for more than `MAX_IDLE_TIME` seconds
       */
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
};

export default updateFilesDataFrozenStates;
