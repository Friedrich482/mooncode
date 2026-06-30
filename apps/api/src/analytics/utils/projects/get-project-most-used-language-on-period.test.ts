import { describe, expect, it } from "vitest";

import { getProjectMostUsedLanguageOnPeriod } from "./get-project-most-used-language-on-period";

describe("getProjectMostUsedLanguageOnPeriod", () => {
  it("should return the slug of the language that has been the most used on the selected period for the project", () => {
    const mockedEntry = {
      typescript: 5000,
      rust: 2500,
      python: 4000,
      go: 6000,
      yaml: 5600,
      json: 8600,
      astro: 3100,
    };

    const mockedOutput = "json";

    const mostUsedLanguageSlug =
      getProjectMostUsedLanguageOnPeriod(mockedEntry);

    expect(mostUsedLanguageSlug).toBeDefined();
    expect(mostUsedLanguageSlug).toEqual(mockedOutput);
  });

  it("should return N/A if there is no languages data on the period", () => {
    const mockedEntry = {};

    const mockedOutput = "N/A";

    const mostUsedLanguageSlug =
      getProjectMostUsedLanguageOnPeriod(mockedEntry);

    expect(mostUsedLanguageSlug).toBeDefined();
    expect(mostUsedLanguageSlug).toEqual(mockedOutput);
  });
});
