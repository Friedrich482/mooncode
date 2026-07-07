import vscode from "vscode";

import { GitExtension } from "./git";

export const getCurrentGitBranch = (projectPath: string) => {
  const extension = vscode.extensions.getExtension<GitExtension>("vscode.git");

  if (!extension || !extension.isActive) {
    return null;
  }

  const git = extension.exports.getAPI(1);

  const repository = git.repositories.find(
    (repository) => repository.rootUri.path === projectPath,
  );

  if (!repository) {
    return null;
  }

  const currentBranch = repository.state.HEAD;
  if (!currentBranch) {
    return null;
  }

  const branchName = currentBranch.name;
  if (!branchName) {
    return null;
  }

  return branchName;
};
