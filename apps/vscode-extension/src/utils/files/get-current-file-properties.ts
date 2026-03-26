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
