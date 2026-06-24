import { describe, expect, it } from "vitest";

import { getPeriodLanguagesGroupedByDays } from "./get-period-languages-grouped-by-days";

describe("getPeriodLanguagesGroupedByDays", () => {
  it("should return the data in the expected shape", () => {
    const mockedEntry: {
      id: string;
      timeSpent: number;
      date: string;
      languages: Record<string, number>;
    }[] = [
      {
        id: "2",
        timeSpent: 4500,
        date: "2026-06-17",
        languages: { rust: 2500, typescript: 2000 },
      },
      {
        id: "3",
        timeSpent: 2500,
        date: "2026-06-18",
        languages: { javascript: 1000, python: 1500 },
      },
      {
        id: "4",
        timeSpent: 12900,
        date: "2026-06-19",
        languages: { json: 2000, docker: 5000, yaml: 5900 },
      },
      {
        id: "5",
        timeSpent: 8200,
        date: "2026-06-20",
        languages: { go: 2000, typescript: 6200 },
      },
      {
        id: "6",
        timeSpent: 6700,
        date: "2026-06-21",
        languages: { typescript: 4700, html: 1000, css: 1000 },
      },
    ];

    const mockedOutput = [
      {
        date: "Wednesday",
        originalDate: "Wed Jun 17 2026",
        rust: 2500,
        timeSpent: 4500,
        typescript: 2000,
      },
      {
        date: "Thursday",
        javascript: 1000,
        originalDate: "Thu Jun 18 2026",
        python: 1500,
        timeSpent: 2500,
      },
      {
        date: "Friday",
        docker: 5000,
        json: 2000,
        originalDate: "Fri Jun 19 2026",
        timeSpent: 12900,
        yaml: 5900,
      },
      {
        date: "Saturday",
        go: 2000,
        originalDate: "Sat Jun 20 2026",
        timeSpent: 8200,
        typescript: 6200,
      },
      {
        css: 1000,
        date: "Sunday",
        html: 1000,
        originalDate: "Sun Jun 21 2026",
        timeSpent: 6700,
        typescript: 4700,
      },
    ];

    const periodLanguagesPerDay = getPeriodLanguagesGroupedByDays(mockedEntry);

    expect(periodLanguagesPerDay).toBeDefined();
    expect(periodLanguagesPerDay).toEqual(mockedOutput);
  });
});
