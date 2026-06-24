import { describe, expect, it } from "vitest";

import { getGeneralStatsOnPeriodGroupedByDays } from "./get-general-stats-on-period-grouped-by-days";

describe("getGeneralStatsOnPeriodGroupedByDays", () => {
  it("should return an object containing the expected properties: avgTime, percentageToAvg and mostActiveDate", () => {
    const mockedEntry = {
      start: "2026-06-17",
      end: "2026-06-18",
      timeSpentOnPeriod: 34800,
      timeSpentToday: 8900,
      dailyDataForPeriod: [
        {
          id: "2",
          timeSpent: 4500,
          date: "2026-06-17",
        },
        {
          id: "3",
          timeSpent: 2500,
          date: "2026-06-18",
        },
        {
          id: "4",
          timeSpent: 12900,
          date: "2026-06-19",
        },
        {
          id: "5",
          timeSpent: 8200,
          date: "2026-06-20",
        },
        {
          id: "6",
          timeSpent: 6700,
          date: "2026-06-21",
        },
      ],
    };

    const mockedOutput = {
      avgTime: "4 hrs 50 mins",
      mostActiveDate: "Fri Jun 19 2026",
      percentageToAvg: -48.85,
    };

    const stats = getGeneralStatsOnPeriodGroupedByDays(mockedEntry);

    expect(stats).toBeDefined();
    expect(stats).toEqual(mockedOutput);
  });

  it("should return an empty state if all the days have a timeSpent of 0", () => {
    const mockedEntry = {
      start: "2026-06-17",
      end: "2026-06-18",
      timeSpentOnPeriod: 0,
      timeSpentToday: 8900,
      dailyDataForPeriod: [
        {
          id: "2",
          timeSpent: 0,
          date: "2026-06-17",
        },
        {
          id: "3",
          timeSpent: 0,
          date: "2026-06-18",
        },
        {
          id: "4",
          timeSpent: 0,
          date: "2026-06-19",
        },
        {
          id: "5",
          timeSpent: 0,
          date: "2026-06-20",
        },
        {
          id: "6",
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

    const stats = getGeneralStatsOnPeriodGroupedByDays(mockedEntry);

    expect(stats).toBeDefined();
    expect(stats).toEqual(mockedOutput);
  });
});
