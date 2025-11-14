import * as vscode from "vscode";

import { filesData } from "@/constants";

import getLanguageSlug from "../languages/getLanguageSlug";
import getCurrentFileProperties from "./getCurrentFileProperties";

const updateCurrentFileObj = (document: vscode.TextDocument | undefined) => {
  const { absolutePath, projectName, projectPath, fileName } =
    getCurrentFileProperties(document);
  const currentLanguageSlug = getLanguageSlug(document);

  if (
    !absolutePath ||
    !projectName ||
    !projectPath ||
    !currentLanguageSlug ||
    !fileName
  ) {
    return;
  }

  if (!filesData[absolutePath]) {
    filesData[absolutePath] = {
      elapsedTime: 0,
      startTime: performance.now(),
      lastActivityTime: performance.now(),
      frozenTime: null,
      freezeStartTime: null,
      isFrozen: false,
      projectName,
      projectPath,
      languageSlug: currentLanguageSlug,
      fileName,
    };
  }

  const currentFileData = filesData[absolutePath];

  currentFileData.lastActivityTime = performance.now();
  currentFileData.languageSlug = currentLanguageSlug;
  currentFileData.projectName = projectName;
  currentFileData.projectPath = projectPath;
};

export default updateCurrentFileObj;
