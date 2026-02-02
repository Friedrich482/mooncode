import languagesAttributes from "#colors.json";
import { DEFAULT_COLOR } from "#constants.ts";

export const getLanguageColor = (languageSlug: string) => {
  let languageColor: string = "";
  try {
    languageColor =
      languagesAttributes[languageSlug as keyof typeof languagesAttributes]
        .color;
  } catch {
    languageColor = DEFAULT_COLOR;
  }
  return languageColor;
};
