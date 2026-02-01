import * as path from "path";
import * as vscode from "vscode";

export const getCurrentFileProperties = (
  document: vscode.TextDocument | undefined,
) => {
  if (!document) {
    return {
      projectName: null,
      projectPath: null,
      absolutePath: null,
      fileName: null,
    };
  }

  const fileUri = document.uri;

  const projectName = vscode.workspace.getWorkspaceFolder(fileUri)?.name;
  const projectPath = vscode.workspace.getWorkspaceFolder(fileUri)?.uri.fsPath;

  if (!projectName || !projectPath) {
    return {
      projectName: null,
      projectPath: null,
      absolutePath: null,
      fileName: null,
    };
  }

  const absolutePath = path.normalize(fileUri.fsPath);
  const fileName = path.basename(absolutePath);

  return {
    projectName,
    projectPath,
    absolutePath,
    fileName,
  };
};
