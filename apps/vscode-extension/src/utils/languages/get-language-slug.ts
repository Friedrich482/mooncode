import vscode from "vscode";

import { KNOWN_LANGUAGES, SUBSET_LANGUAGES } from "@/constants";

export const getLanguageSlug = (document: vscode.TextDocument | undefined) => {
  if (
    !document ||
    (document.uri.scheme !== "file" &&
      document.uri.scheme !== "vscode-notebook-cell")
  ) {
    return;
  }

  let languageSlug = document.languageId;

  // if the language is not known (yet) by vscode, it will use "plaintext" as language identifier
  // for example, zig or kotlin will not be detected as known languages unless you install their vscode extensions
  // we try to get the file extension (for example .zig or .kt) then if we have the right language in our mapping, we use it
  if (languageSlug === "plaintext" || languageSlug === "ignore") {
    const extension = document.uri.fsPath.split(".").pop()?.toLowerCase() ?? "";

    if (Object.hasOwn(KNOWN_LANGUAGES, extension)) {
      return KNOWN_LANGUAGES[extension];
    }
  }

  // if the languageSlug given by vscode is a subset of a language
  // for example dockerfile (subset of docker)
  // just assign it to the language itself instead of using that subset
  if (SUBSET_LANGUAGES[languageSlug]) {
    languageSlug = SUBSET_LANGUAGES[languageSlug];
  }

  // if the file is a jupyter notebook (specific kind of file that can have many cells
  // with different languages), we have a dedicated slug for it
  if (document.uri.scheme === "vscode-notebook-cell") {
    languageSlug = "jupyternotebook";
  }

  return languageSlug;
};
