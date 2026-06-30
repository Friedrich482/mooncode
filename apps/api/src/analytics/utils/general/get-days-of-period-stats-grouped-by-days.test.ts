import { beforeEach, describe, expect, it, vi } from "vitest";

import { getDaysOfPeriodStatsGroupedByDays } from "./get-days-of-period-stats-grouped-by-days";

describe("getDaysOfPeriodStatsGroupedByDays", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("should return the data in the expected format", () => {
    const mockedEntry = [
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
    ];

    const mockedOutput = [
      {
        timeSpentLine: 4500,
        originalDate: "Wed Jun 17 2026",
        date: "Wednesday",
        timeSpentBar: 4500,
        timeSpentArea: 4500,
        value: "1 hr 15 mins",
      },
      {
        timeSpentLine: 2500,
        originalDate: "Thu Jun 18 2026",
        date: "Thursday",
        timeSpentBar: 2500,
        timeSpentArea: 2500,
        value: "41 mins",
      },
      {
        timeSpentLine: 12900,
        originalDate: "Fri Jun 19 2026",
        date: "Friday",
        timeSpentBar: 12900,
        timeSpentArea: 12900,
        value: "3 hrs 35 mins",
      },
      {
        timeSpentLine: 8200,
        originalDate: "Sat Jun 20 2026",
        date: "Saturday",
        timeSpentBar: 8200,
        timeSpentArea: 8200,
        value: "2 hrs 16 mins",
      },
      {
        timeSpentLine: 6700,
        originalDate: "Sun Jun 21 2026",
        date: "Sunday",
        timeSpentBar: 6700,
        timeSpentArea: 6700,
        value: "1 hr 51 mins",
      },
    ];

    const daysOfPeriodStats = getDaysOfPeriodStatsGroupedByDays(mockedEntry);

    expect(daysOfPeriodStats).toBeDefined();
    expect(daysOfPeriodStats).toEqual(mockedOutput);
  });
});
