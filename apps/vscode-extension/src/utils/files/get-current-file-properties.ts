import * as path from "path";
import vscode from "vscode";

import { getCurrentGitBranch } from "../branch/get-current-git-branch";

export const getCurrentFileProperties = (
  document: vscode.TextDocument | undefined,
) => {
  if (!document) {
    return {
      projectName: null,
      projectPath: null,
      absolutePath: null,
      fileName: null,
      branchName: null,
    };
  }

  const fileUri = document.uri;

  const workspaceFolder = vscode.workspace.getWorkspaceFolder(
    fileUri.with({ scheme: "file" }),
  );
  const projectName = workspaceFolder?.name;
  const projectPath = workspaceFolder?.uri.fsPath;

  if (!projectName || !projectPath) {
    return {
      projectName: null,
      projectPath: null,
      absolutePath: null,
      fileName: null,
      branchName: null,
    };
  }

  const branchName = getCurrentGitBranch(projectPath);

  const absolutePath = path.normalize(fileUri.fsPath);
  const fileName = path.basename(absolutePath);

  return {
    projectName,
    projectPath,
    absolutePath,
    fileName,
    branchName,
  };
};
