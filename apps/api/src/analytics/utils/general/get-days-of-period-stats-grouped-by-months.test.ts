import { describe, expect, it } from "vitest";

import { getDaysOfPeriodStatsGroupedByMonths } from "./get-days-of-period-stats-grouped-by-months";

describe("getDaysOfPeriodStatsGroupedByMonths", () => {
  it("should return the data in the expected shape", () => {
    const mockedEntry = [
      { id: "2", timeSpent: 4500, date: "2026-05-12" },
      { id: "3", timeSpent: 3200, date: "2026-05-13" },
      { id: "4", timeSpent: 7800, date: "2026-05-14" },
      { id: "5", timeSpent: 5100, date: "2026-05-15" },
      { id: "6", timeSpent: 9300, date: "2026-05-16" },
      { id: "7", timeSpent: 2700, date: "2026-05-17" },
      { id: "8", timeSpent: 6400, date: "2026-05-18" },
      { id: "9", timeSpent: 11200, date: "2026-05-19" },
      { id: "10", timeSpent: 4800, date: "2026-05-20" },
      { id: "11", timeSpent: 7600, date: "2026-05-21" },
      { id: "12", timeSpent: 3300, date: "2026-05-22" },
      { id: "13", timeSpent: 8900, date: "2026-05-23" },
      { id: "14", timeSpent: 5500, date: "2026-05-24" },
      { id: "15", timeSpent: 12100, date: "2026-05-25" },
      { id: "16", timeSpent: 4200, date: "2026-05-26" },
      { id: "17", timeSpent: 6800, date: "2026-05-27" },
      { id: "18", timeSpent: 9700, date: "2026-05-28" },
      { id: "19", timeSpent: 3600, date: "2026-05-29" },
      { id: "20", timeSpent: 7100, date: "2026-05-30" },
      { id: "21", timeSpent: 5400, date: "2026-05-31" },
      { id: "22", timeSpent: 8300, date: "2026-06-01" },
      { id: "23", timeSpent: 2900, date: "2026-06-02" },
      { id: "24", timeSpent: 10500, date: "2026-06-03" },
      { id: "25", timeSpent: 4600, date: "2026-06-04" },
      { id: "26", timeSpent: 7300, date: "2026-06-05" },
      { id: "27", timeSpent: 6100, date: "2026-06-06" },
      { id: "28", timeSpent: 3800, date: "2026-06-07" },
      { id: "29", timeSpent: 9200, date: "2026-06-08" },
      { id: "30", timeSpent: 5700, date: "2026-06-09" },
      { id: "31", timeSpent: 11800, date: "2026-06-10" },
      { id: "32", timeSpent: 4100, date: "2026-06-11" },
      { id: "33", timeSpent: 4500, date: "2026-06-12" },
      { id: "34", timeSpent: 1500, date: "2026-06-13" },
      { id: "35", timeSpent: 3800, date: "2026-06-14" },
      { id: "36", timeSpent: 14500, date: "2026-06-15" },
      { id: "37", timeSpent: 5900, date: "2026-06-16" },
      { id: "38", timeSpent: 4500, date: "2026-06-17" },
      { id: "39", timeSpent: 2500, date: "2026-06-18" },
      { id: "40", timeSpent: 12900, date: "2026-06-19" },
      { id: "41", timeSpent: 8200, date: "2026-06-20" },
      { id: "42", timeSpent: 6700, date: "2026-06-21" },
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
      getDaysOfPeriodStatsGroupedByMonths(mockedEntry);

    expect(daysOfPeriodStatsGroupedByMonths).toBeDefined();
    expect(daysOfPeriodStatsGroupedByMonths).toEqual(mockedOutput);
  });
});
