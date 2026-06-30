import { describe, expect, it } from "vitest";

import { getProjectLanguagesGroupedByDays } from "./get-project-languages-grouped-by-days";

describe("getProjectLanguagesGroupedByDays", () => {
  it("should return the data in the expected shape", () => {
    const mockedEntry = {
      data: [
        {
          date: "2026-06-17",
          timeSpent: 4500,
        },
        {
          date: "2026-06-18",
          timeSpent: 7500,
        },
        {
          date: "2026-06-19",
          timeSpent: 12000,
        },
        {
          date: "2026-06-20",
          timeSpent: 9800,
        },
        {
          date: "2026-06-21",
          timeSpent: 15000,
        },
      ],
      languagesTimesPerDayOfPeriod: {
        "2026-06-17": {
          typescript: 2500,
          rust: 2000,
        },
        "2026-06-18": {
          javascript: 4000,
          typescript: 3500,
        },
        "2026-06-19": {
          javascript: 4000,
          python: 5000,
          html: 3000,
        },
        "2026-06-20": {
          go: 6000,
          yaml: 3800,
        },
        "2026-06-21": {
          go: 6000,
          docker: 9000,
        },
      },
    };

    const mockedOutput = [
      {
        date: "Wednesday",
        originalDate: "Wed Jun 17 2026",
        rust: 2000,
        timeSpent: 4500,
        typescript: 2500,
      },
      {
        date: "Thursday",
        javascript: 4000,
        originalDate: "Thu Jun 18 2026",
        timeSpent: 7500,
        typescript: 3500,
      },
      {
        date: "Friday",
        html: 3000,
        javascript: 4000,
        originalDate: "Fri Jun 19 2026",
        python: 5000,
        timeSpent: 12000,
      },
      {
        date: "Saturday",
        go: 6000,
        originalDate: "Sat Jun 20 2026",
        timeSpent: 9800,
        yaml: 3800,
      },
      {
        date: "Sunday",
        docker: 9000,
        go: 6000,
        originalDate: "Sun Jun 21 2026",
        timeSpent: 15000,
      },
    ];

    const periodLanguagesPerDayOfPeriod = getProjectLanguagesGroupedByDays(
      mockedEntry.data,
      mockedEntry.languagesTimesPerDayOfPeriod,
    );

    expect(periodLanguagesPerDayOfPeriod).toBeDefined();
    expect(periodLanguagesPerDayOfPeriod).toEqual(mockedOutput);
  });
});
