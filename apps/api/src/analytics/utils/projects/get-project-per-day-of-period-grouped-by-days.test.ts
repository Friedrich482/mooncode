import { describe, expect, it } from "vitest";

import { getProjectPerDayOfPeriodGroupedByDays } from "./get-project-per-day-of-period-grouped-by-days";

describe("getProjectPerDayOfPeriodGroupedByDays", () => {
  it("should return the data under the expected format", () => {
    const mockedEntry = [
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
    ];

    const mockedOutput = [
      {
        date: "Wednesday",
        originalDate: "Wed Jun 17 2026",
        timeSpentArea: 4500,
        timeSpentBar: 4500,
        timeSpentLine: 4500,
        value: "1 hr 15 mins",
      },
      {
        date: "Thursday",
        originalDate: "Thu Jun 18 2026",
        timeSpentArea: 7500,
        timeSpentBar: 7500,
        timeSpentLine: 7500,
        value: "2 hrs 5 mins",
      },
      {
        date: "Friday",
        originalDate: "Fri Jun 19 2026",
        timeSpentArea: 12000,
        timeSpentBar: 12000,
        timeSpentLine: 12000,
        value: "3 hrs 20 mins",
      },
      {
        date: "Saturday",
        originalDate: "Sat Jun 20 2026",
        timeSpentArea: 9800,
        timeSpentBar: 9800,
        timeSpentLine: 9800,
        value: "2 hrs 43 mins",
      },
      {
        date: "Sunday",
        originalDate: "Sun Jun 21 2026",
        timeSpentArea: 15000,
        timeSpentBar: 15000,
        timeSpentLine: 15000,
        value: "4 hrs 10 mins",
      },
    ];

    const projectsPerDayOfPeriod =
      getProjectPerDayOfPeriodGroupedByDays(mockedEntry);

    expect(projectsPerDayOfPeriod).toBeDefined();
    expect(projectsPerDayOfPeriod).toEqual(mockedOutput);
  });
});
