import { describe, expect, it } from "vitest";

import { getMostUsedLanguageOnPeriod } from "./get-most-used-language-on-period";

describe("getMostUsedLanguageOnPeriod", () => {
  it("should return the slug of the language that has been the most used on the selected period", () => {
    const mockedEntry = [
      {
        languageSlug: "javascript",
        time: 1000,
        value: "16 mins",
        percentage: 2.87,
      },
      {
        languageSlug: "html",
        time: 1000,
        value: "16 mins",
        percentage: 2.87,
      },
      {
        languageSlug: "css",
        time: 1000,
        value: "16 mins",
        percentage: 2.87,
      },
      {
        languageSlug: "python",
        time: 1500,
        value: "25 mins",
        percentage: 4.31,
      },
      {
        languageSlug: "json",
        time: 2000,
        value: "33 mins",
        percentage: 5.75,
      },
      {
        languageSlug: "go",
        time: 2000,
        value: "33 mins",
        percentage: 5.75,
      },
      {
        languageSlug: "rust",
        percentage: 7.18,
        time: 2500,
        value: "41 mins",
      },
      {
        languageSlug: "docker",
        time: 5000,
        value: "1 hr 23 mins",
        percentage: 14.37,
      },
      {
        languageSlug: "yaml",
        time: 5900,
        value: "1 hr 38 mins",
        percentage: 16.95,
      },
      {
        languageSlug: "typescript",
        time: 12900,
        value: "3 hrs 35 mins",
        percentage: 37.07,
      },
    ];

    const languageSlug = getMostUsedLanguageOnPeriod(mockedEntry);

    expect(languageSlug).toBeDefined();
    expect(languageSlug).toEqual("typescript");
  });

  it("should return N/A if there is no languages data on the period", () => {
    const mockedEntry: {
      languageSlug: string;
      time: number;
      value: string;
      percentage: number;
    }[] = [];

    const languageSlug = getMostUsedLanguageOnPeriod(mockedEntry);

    expect(languageSlug).toBeDefined();
    expect(languageSlug).toEqual("N/A");
  });
});
