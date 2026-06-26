import { describe, expect, it } from "vitest";

import { getProjectPerDayOfPeriodGroupedByMonths } from "./get-project-per-day-of-period-grouped-by-months";

describe("getProjectPerDayOfPeriodGroupedByMonths", () => {
  it("should return the data in the expected shape", () => {
    const mockedEntry = [
      { timeSpent: 4500, date: "2026-05-12" },
      { timeSpent: 3200, date: "2026-05-13" },
      { timeSpent: 7800, date: "2026-05-14" },
      { timeSpent: 5100, date: "2026-05-15" },
      { timeSpent: 9300, date: "2026-05-16" },
      { timeSpent: 2700, date: "2026-05-17" },
      { timeSpent: 6400, date: "2026-05-18" },
      { timeSpent: 11200, date: "2026-05-19" },
      { timeSpent: 4800, date: "2026-05-20" },
      { timeSpent: 7600, date: "2026-05-21" },
      { timeSpent: 3300, date: "2026-05-22" },
      { timeSpent: 8900, date: "2026-05-23" },
      { timeSpent: 5500, date: "2026-05-24" },
      { timeSpent: 12100, date: "2026-05-25" },
      { timeSpent: 4200, date: "2026-05-26" },
      { timeSpent: 6800, date: "2026-05-27" },
      { timeSpent: 9700, date: "2026-05-28" },
      { timeSpent: 3600, date: "2026-05-29" },
      { timeSpent: 7100, date: "2026-05-30" },
      { timeSpent: 5400, date: "2026-05-31" },
      { timeSpent: 8300, date: "2026-06-01" },
      { timeSpent: 2900, date: "2026-06-02" },
      { timeSpent: 10500, date: "2026-06-03" },
      { timeSpent: 4600, date: "2026-06-04" },
      { timeSpent: 7300, date: "2026-06-05" },
      { timeSpent: 6100, date: "2026-06-06" },
      { timeSpent: 3800, date: "2026-06-07" },
      { timeSpent: 9200, date: "2026-06-08" },
      { timeSpent: 5700, date: "2026-06-09" },
      { timeSpent: 11800, date: "2026-06-10" },
      { timeSpent: 4100, date: "2026-06-11" },
      { timeSpent: 4500, date: "2026-06-12" },
      { timeSpent: 1500, date: "2026-06-13" },
      { timeSpent: 3800, date: "2026-06-14" },
      { timeSpent: 14500, date: "2026-06-15" },
      { timeSpent: 5900, date: "2026-06-16" },
      { timeSpent: 4500, date: "2026-06-17" },
      { timeSpent: 2500, date: "2026-06-18" },
      { timeSpent: 12900, date: "2026-06-19" },
      { timeSpent: 8200, date: "2026-06-20" },
      { timeSpent: 6700, date: "2026-06-21" },
    ];

    const mockedOutput = [
      {
        date: "May 1 - May 31",
        originalDate: "May 1 - May 31",
        timeSpentArea: 129200,
        timeSpentBar: 129200,
        timeSpentLine: 129200,
        value: "35 hrs 53 mins",
      },
      {
        date: "Jun 1 - Jun 21",
        originalDate: "Jun 1 - Jun 21",
        timeSpentArea: 139300,
        timeSpentBar: 139300,
        timeSpentLine: 139300,
        value: "38 hrs 41 mins",
      },
    ];

    const daysOfPeriodStatsGroupedByMonths =
      getProjectPerDayOfPeriodGroupedByMonths(mockedEntry);

    expect(daysOfPeriodStatsGroupedByMonths).toBeDefined();
    expect(daysOfPeriodStatsGroupedByMonths).toEqual(mockedOutput);
  });
});
