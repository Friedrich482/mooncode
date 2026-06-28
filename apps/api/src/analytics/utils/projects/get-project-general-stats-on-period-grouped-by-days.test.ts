import { describe, expect, it } from "vitest";

import { getProjectGeneralStatsOnPeriodGroupedByDays } from "./get-project-general-stats-on-period-grouped-by-days";

describe("getProjectGeneralStatsOnPeriodGroupedByDays", () => {
  it("should return an object containing the expected properties: avgTime, percentageToAvg and mostActiveDate", () => {
    const mockedEntry = {
      start: "2026-06-17",
      end: "2026-06-21",
      totalTimeSpentOnPeriod: 34800,
      timeSpentOnProjectToday: 8900,
      projectPerDayOfPeriod: [
        {
          timeSpent: 4500,
          date: "2026-06-17",
        },
        {
          timeSpent: 2500,
          date: "2026-06-18",
        },
        {
          timeSpent: 12900,
          date: "2026-06-19",
        },
        {
          timeSpent: 8200,
          date: "2026-06-20",
        },
        {
          timeSpent: 6700,
          date: "2026-06-21",
        },
      ],
    };

    const mockedOutput = {
      avgTime: "1 hr 56 mins",
      mostActiveDate: "Fri Jun 19 2026",
      percentageToAvg: 27.87,
    };

    const stats = getProjectGeneralStatsOnPeriodGroupedByDays(mockedEntry);

    expect(stats).toBeDefined();
    expect(stats).toEqual(mockedOutput);
  });

  it("should return an empty state if all the days have a timeSpent of 0 for the project", () => {
    const mockedEntry = {
      start: "2026-06-17",
      end: "2026-06-21",
      totalTimeSpentOnPeriod: 0,
      timeSpentOnProjectToday: 8900,
      projectPerDayOfPeriod: [
        {
          timeSpent: 0,
          date: "2026-06-17",
        },
        {
          timeSpent: 0,
          date: "2026-06-18",
        },
        {
          timeSpent: 0,
          date: "2026-06-19",
        },
        {
          timeSpent: 0,
          date: "2026-06-20",
        },
        {
          timeSpent: 0,
          date: "2026-06-21",
        },
      ],
    };

    const mockedOutput = {
      avgTime: "0 secs",
      mostActiveDate: "N/A",
      percentageToAvg: 0,
    };

    const stats = getProjectGeneralStatsOnPeriodGroupedByDays(mockedEntry);

    expect(stats).toBeDefined();
    expect(stats).toEqual(mockedOutput);
  });
});
