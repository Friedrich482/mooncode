import vscode from "vscode";

import { knownLanguages, languageMapping } from "@/constants";

const getLanguageSlug = (document: vscode.TextDocument | undefined) => {
  if (!document || document.uri.scheme !== "file") {
    return;
  }

  let languageSlug = document.languageId;

  if (languageSlug === "plaintext" || languageSlug === "ignore") {
    const extension = document.uri.fsPath.split(".").pop()?.toLowerCase() ?? "";

    if (Object.hasOwn(knownLanguages, extension)) {
      return knownLanguages[extension];
    }
  }

  // if the languageSlug given by vscode is a subset of a language
  // for example dockerfile (subset of docker)
  // just assign it to the language itself instead of using that subset
  if (languageMapping[languageSlug]) {
    languageSlug = languageMapping[languageSlug];
  }

  return languageSlug;
};

export default getLanguageSlug;
