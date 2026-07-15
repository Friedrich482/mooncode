import vscode from "vscode";

import { filesData } from "@/constants";

import { getLanguageSlug } from "../languages/get-language-slug";
import { getCurrentFileProperties } from "./get-current-file-properties";

export const updateCurrentFileObj = (
  document: vscode.TextDocument | undefined,
) => {
  const { absolutePath, projectName, projectPath, fileName, branchName } =
    getCurrentFileProperties(document);
  const currentLanguageSlug = getLanguageSlug(document);

  if (
    !absolutePath ||
    !projectName ||
    !projectPath ||
    !currentLanguageSlug ||
    !fileName ||
    !branchName
  ) {
    return;
  }

  filesData[projectPath] ??= {};
  filesData[projectPath][branchName] ??= {};
  filesData[projectPath][branchName][absolutePath] ??= {
    elapsedTime: 0,
    startTime: performance.now(),
    lastActivityTime: performance.now(),
    frozenTime: null,
    freezeStartTime: null,
    isFrozen: false,
    projectName,
    languageSlug: currentLanguageSlug,
    fileName,
  };

  const currentFileData = filesData[projectPath][branchName][absolutePath];

  currentFileData.lastActivityTime = performance.now();
  currentFileData.languageSlug = currentLanguageSlug;
  currentFileData.projectName = projectName;
};
