import { describe, expect, it } from "vitest";

import { getPeriodLanguagesGroupedByWeeks } from "./get-period-languages-grouped-by-weeks";

describe("getPeriodLanguagesGroupedByWeeks", () => {
  it("should return the data in the expected shape when the period resolution is 'week'", () => {
    const mockedEntry: {
      id: string;
      timeSpent: number;
      date: string;
      languages: Record<string, number>;
    }[] = [
      {
        id: "2",
        timeSpent: 4500,
        date: "2026-06-12",
        languages: { rust: 2500, typescript: 2000 },
      },
      {
        id: "3",
        timeSpent: 1500,
        date: "2026-06-13",
        languages: { javascript: 1500 },
      },
      {
        id: "4",
        timeSpent: 3800,
        date: "2026-06-14",
        languages: { javascript: 1800, python: 2000 },
      },
      {
        id: "5",
        timeSpent: 14500,
        date: "2026-06-15",
        languages: { json: 4000, docker: 5000, yaml: 5500 },
      },
      {
        id: "6",
        timeSpent: 5900,
        date: "2026-06-16",
        languages: { yaml: 5900 },
      },
      {
        id: "7",
        timeSpent: 4500,
        date: "2026-06-17",
        languages: { c: 2500, typescript: 2000 },
      },
      {
        id: "8",
        timeSpent: 2500,
        date: "2026-06-18",
        languages: { sql: 2500 },
      },
      {
        id: "9",
        timeSpent: 12900,
        date: "2026-06-19",
        languages: { json: 4000, docker: 5000, yaml: 3900 },
      },
      {
        id: "10",
        timeSpent: 8200,
        date: "2026-06-20",
        languages: { go: 2000, typescript: 6200 },
      },
      {
        id: "11",
        timeSpent: 6700,
        date: "2026-06-21",
        languages: {
          typescript: 4700,
          html: 1000,
          css: 1000,
        },
      },
    ];

    const mockedOutput = [
      {
        date: "Jun 12 - Jun 13",
        javascript: 1500,
        originalDate: "Jun 12 - Jun 13",
        rust: 2500,
        timeSpent: 6000,
        typescript: 2000,
      },
      {
        c: 2500,
        date: "Jun 14 - Jun 20",
        docker: 10000,
        go: 2000,
        javascript: 1800,
        json: 8000,
        originalDate: "Jun 14 - Jun 20",
        python: 2000,
        sql: 2500,
        timeSpent: 52300,
        typescript: 8200,
        yaml: 15300,
      },
      {
        css: 1000,
        date: "Jun 21 - Jun 21",
        html: 1000,
        originalDate: "Jun 21 - Jun 21",
        timeSpent: 6700,
        typescript: 4700,
      },
    ];

    const periodLanguagesGroupedByWeeks = getPeriodLanguagesGroupedByWeeks(
      mockedEntry,
      "week",
    );

    expect(periodLanguagesGroupedByWeeks).toBeDefined();
    expect(periodLanguagesGroupedByWeeks).toEqual(mockedOutput);
  });

  it("should return the data in the expected shape when the period resolution is 'month'", () => {
    const mockedEntry: {
      id: string;
      timeSpent: number;
      date: string;
      languages: Record<string, number>;
    }[] = [
      {
        id: "2",
        timeSpent: 4500,
        date: "2026-05-12",
        languages: { typescript: 2500, rust: 2000 },
      },
      {
        id: "3",
        timeSpent: 3200,
        date: "2026-05-13",
        languages: { python: 3200 },
      },
      {
        id: "4",
        timeSpent: 7800,
        date: "2026-05-14",
        languages: { typescript: 4000, javascript: 3800 },
      },
      {
        id: "5",
        timeSpent: 5100,
        date: "2026-05-15",
        languages: { go: 2600, yaml: 2500 },
      },
      {
        id: "6",
        timeSpent: 9300,
        date: "2026-05-16",
        languages: { rust: 5000, typescript: 4300 },
      },
      {
        id: "7",
        timeSpent: 2700,
        date: "2026-05-17",
        languages: { sql: 2700 },
      },
      {
        id: "8",
        timeSpent: 6400,
        date: "2026-05-18",
        languages: { python: 3200, json: 3200 },
      },
      {
        id: "9",
        timeSpent: 11200,
        date: "2026-05-19",
        languages: { typescript: 6000, html: 2600, css: 2600 },
      },
      {
        id: "10",
        timeSpent: 4800,
        date: "2026-05-20",
        languages: { go: 4800 },
      },
      {
        id: "11",
        timeSpent: 7600,
        date: "2026-05-21",
        languages: { javascript: 4000, python: 3600 },
      },
      {
        id: "12",
        timeSpent: 3300,
        date: "2026-05-22",
        languages: { yaml: 3300 },
      },
      {
        id: "13",
        timeSpent: 8900,
        date: "2026-05-23",
        languages: { rust: 4500, c: 4400 },
      },
      {
        id: "14",
        timeSpent: 5500,
        date: "2026-05-24",
        languages: { typescript: 3000, sql: 2500 },
      },
      {
        id: "15",
        timeSpent: 12100,
        date: "2026-05-25",
        languages: { json: 4000, docker: 4100, yaml: 4000 },
      },
      {
        id: "16",
        timeSpent: 4200,
        date: "2026-05-26",
        languages: { python: 4200 },
      },
      {
        id: "17",
        timeSpent: 6800,
        date: "2026-05-27",
        languages: { typescript: 3500, html: 1700, css: 1600 },
      },
      {
        id: "18",
        timeSpent: 9700,
        date: "2026-05-28",
        languages: { go: 5000, rust: 4700 },
      },
      {
        id: "19",
        timeSpent: 3600,
        date: "2026-05-29",
        languages: { sql: 3600 },
      },
      {
        id: "20",
        timeSpent: 7100,
        date: "2026-05-30",
        languages: { javascript: 3600, python: 3500 },
      },
      {
        id: "21",
        timeSpent: 5400,
        date: "2026-05-31",
        languages: { typescript: 5400 },
      },
      {
        id: "22",
        timeSpent: 8300,
        date: "2026-06-01",
        languages: { rust: 4200, c: 4100 },
      },
      {
        id: "23",
        timeSpent: 2900,
        date: "2026-06-02",
        languages: { yaml: 2900 },
      },
      {
        id: "24",
        timeSpent: 10500,
        date: "2026-06-03",
        languages: { typescript: 5500, javascript: 5000 },
      },
      {
        id: "25",
        timeSpent: 4600,
        date: "2026-06-04",
        languages: { docker: 4600 },
      },
      {
        id: "26",
        timeSpent: 7300,
        date: "2026-06-05",
        languages: { go: 3700, sql: 3600 },
      },
      {
        id: "27",
        timeSpent: 6100,
        date: "2026-06-06",
        languages: { python: 3100, json: 3000 },
      },
      {
        id: "28",
        timeSpent: 3800,
        date: "2026-06-07",
        languages: { typescript: 3800 },
      },
      {
        id: "29",
        timeSpent: 9200,
        date: "2026-06-08",
        languages: { rust: 4700, c: 4500 },
      },
      {
        id: "30",
        timeSpent: 5700,
        date: "2026-06-09",
        languages: { typescript: 3000, html: 1400, css: 1300 },
      },
      {
        id: "31",
        timeSpent: 11800,
        date: "2026-06-10",
        languages: { json: 4000, docker: 4000, yaml: 3800 },
      },
      {
        id: "32",
        timeSpent: 4100,
        date: "2026-06-11",
        languages: { go: 4100 },
      },
      {
        id: "33",
        timeSpent: 4500,
        date: "2026-06-12",
        languages: { rust: 2500, typescript: 2000 },
      },
      {
        id: "34",
        timeSpent: 1500,
        date: "2026-06-13",
        languages: { javascript: 1500 },
      },
      {
        id: "35",
        timeSpent: 3800,
        date: "2026-06-14",
        languages: { javascript: 1800, python: 2000 },
      },
      {
        id: "36",
        timeSpent: 14500,
        date: "2026-06-15",
        languages: { json: 4000, docker: 5000, yaml: 5500 },
      },
      {
        id: "37",
        timeSpent: 5900,
        date: "2026-06-16",
        languages: { yaml: 5900 },
      },
      {
        id: "38",
        timeSpent: 4500,
        date: "2026-06-17",
        languages: { c: 2500, typescript: 2000 },
      },
      {
        id: "39",
        timeSpent: 2500,
        date: "2026-06-18",
        languages: { sql: 2500 },
      },
      {
        id: "40",
        timeSpent: 12900,
        date: "2026-06-19",
        languages: { json: 4000, docker: 5000, yaml: 3900 },
      },
      {
        id: "41",
        timeSpent: 8200,
        date: "2026-06-20",
        languages: { go: 2000, typescript: 6200 },
      },
      {
        id: "42",
        timeSpent: 6700,
        date: "2026-06-21",
        languages: { typescript: 4700, html: 1000, css: 1000 },
      },
    ];

    const mockedOutput = [
      {
        date: "May 10 - May 16",
        go: 2600,
        javascript: 3800,
        originalDate: "May 10 - May 16",
        python: 3200,
        rust: 7000,
        timeSpent: 29900,
        typescript: 10800,
        yaml: 2500,
      },
      {
        c: 4400,
        css: 2600,
        date: "May 17 - May 23",
        go: 4800,
        html: 2600,
        javascript: 4000,
        json: 3200,
        originalDate: "May 17 - May 23",
        python: 6800,
        rust: 4500,
        sql: 2700,
        timeSpent: 44900,
        typescript: 6000,
        yaml: 3300,
      },
      {
        css: 1600,
        date: "May 24 - May 30",
        docker: 4100,
        go: 5000,
        html: 1700,
        javascript: 3600,
        json: 4000,
        originalDate: "May 24 - May 30",
        python: 7700,
        rust: 4700,
        sql: 6100,
        timeSpent: 49000,
        typescript: 6500,
        yaml: 4000,
      },
      {
        c: 4100,
        date: "May 31 - Jun 6",
        docker: 4600,
        go: 3700,
        javascript: 5000,
        json: 3000,
        originalDate: "May 31 - Jun 6",
        python: 3100,
        rust: 4200,
        sql: 3600,
        timeSpent: 45100,
        typescript: 10900,
        yaml: 2900,
      },
      {
        c: 4500,
        css: 1300,
        date: "Jun 7 - Jun 13",
        docker: 4000,
        go: 4100,
        html: 1400,
        javascript: 1500,
        json: 4000,
        originalDate: "Jun 7 - Jun 13",
        rust: 7200,
        timeSpent: 40600,
        typescript: 8800,
        yaml: 3800,
      },
      {
        c: 2500,
        date: "Jun 14 - Jun 20",
        docker: 10000,
        go: 2000,
        javascript: 1800,
        json: 8000,
        originalDate: "Jun 14 - Jun 20",
        python: 2000,
        sql: 2500,
        timeSpent: 52300,
        typescript: 8200,
        yaml: 15300,
      },
      {
        css: 1000,
        date: "Jun 21 - Jun 27",
        html: 1000,
        originalDate: "Jun 21 - Jun 27",
        timeSpent: 6700,
        typescript: 4700,
      },
    ];

    const periodLanguagesGroupedByWeeks = getPeriodLanguagesGroupedByWeeks(
      mockedEntry,
      "month",
    );

    expect(periodLanguagesGroupedByWeeks).toBeDefined();
    expect(periodLanguagesGroupedByWeeks).toEqual(mockedOutput);
  });

  it("should adjust the weeks boundaries when the period resolution is 'month' is there is overflow at the beginning or the end of the month", () => {
    const mockedEntry: {
      id: string;
      timeSpent: number;
      date: string;
      languages: Record<string, number>;
    }[] = [
      {
        id: "1",
        timeSpent: 6100,
        date: "2025-07-01",
        languages: { typescript: 3500, javascript: 2600 },
      },
      {
        id: "2",
        timeSpent: 4300,
        date: "2025-07-02",
        languages: { python: 4300 },
      },
      {
        id: "3",
        timeSpent: 8700,
        date: "2025-07-03",
        languages: { rust: 4500, c: 4200 },
      },
      {
        id: "4",
        timeSpent: 3900,
        date: "2025-07-04",
        languages: { sql: 3900 },
      },
      {
        id: "5",
        timeSpent: 7200,
        date: "2025-07-05",
        languages: { go: 3800, yaml: 3400 },
      },
      {
        id: "6",
        timeSpent: 5500,
        date: "2025-07-06",
        languages: { typescript: 5500 },
      },
      {
        id: "7",
        timeSpent: 11300,
        date: "2025-07-07",
        languages: { json: 4000, docker: 4000, yaml: 3300 },
      },
      {
        id: "8",
        timeSpent: 4100,
        date: "2025-07-08",
        languages: { python: 4100 },
      },
      {
        id: "9",
        timeSpent: 6900,
        date: "2025-07-09",
        languages: { typescript: 3500, html: 1800, css: 1600 },
      },
      {
        id: "10",
        timeSpent: 3500,
        date: "2025-07-10",
        languages: { sql: 3500 },
      },
      {
        id: "11",
        timeSpent: 8400,
        date: "2025-07-11",
        languages: { rust: 4300, go: 4100 },
      },
      {
        id: "12",
        timeSpent: 5200,
        date: "2025-07-12",
        languages: { typescript: 5200 },
      },
      {
        id: "13",
        timeSpent: 3800,
        date: "2025-07-13",
        languages: { javascript: 3800 },
      },
      {
        id: "14",
        timeSpent: 7100,
        date: "2025-07-14",
        languages: { python: 3600, json: 3500 },
      },
      {
        id: "15",
        timeSpent: 4600,
        date: "2025-07-15",
        languages: { docker: 4600 },
      },
      {
        id: "16",
        timeSpent: 9300,
        date: "2025-07-16",
        languages: { typescript: 5000, javascript: 4300 },
      },
      {
        id: "17",
        timeSpent: 2700,
        date: "2025-07-17",
        languages: { yaml: 2700 },
      },
      {
        id: "18",
        timeSpent: 6400,
        date: "2025-07-18",
        languages: { go: 3300, sql: 3100 },
      },
      {
        id: "19",
        timeSpent: 11200,
        date: "2025-07-19",
        languages: { rust: 5800, c: 5400 },
      },
      {
        id: "20",
        timeSpent: 4800,
        date: "2025-07-20",
        languages: { typescript: 4800 },
      },
      {
        id: "21",
        timeSpent: 7600,
        date: "2025-07-21",
        languages: { typescript: 4200, html: 1800, css: 1600 },
      },
      {
        id: "22",
        timeSpent: 3300,
        date: "2025-07-22",
        languages: { python: 3300 },
      },
      {
        id: "23",
        timeSpent: 8900,
        date: "2025-07-23",
        languages: { json: 3000, docker: 3000, yaml: 2900 },
      },
      {
        id: "24",
        timeSpent: 5500,
        date: "2025-07-24",
        languages: { go: 5500 },
      },
      {
        id: "25",
        timeSpent: 12100,
        date: "2025-07-25",
        languages: { rust: 6200, typescript: 5900 },
      },
      {
        id: "26",
        timeSpent: 4200,
        date: "2025-07-26",
        languages: { sql: 4200 },
      },
      {
        id: "27",
        timeSpent: 6800,
        date: "2025-07-27",
        languages: { javascript: 3500, python: 3300 },
      },
      {
        id: "28",
        timeSpent: 9700,
        date: "2025-07-28",
        languages: { typescript: 5200, json: 4500 },
      },
      {
        id: "29",
        timeSpent: 3600,
        date: "2025-07-29",
        languages: { yaml: 3600 },
      },
    ];

    const mockedOutput = [
      {
        c: 4200,
        date: "Jul 1 - Jul 5",
        go: 3800,
        javascript: 2600,
        originalDate: "Jul 1 - Jul 5",
        python: 4300,
        rust: 4500,
        sql: 3900,
        timeSpent: 30200,
        typescript: 3500,
        yaml: 3400,
      },
      {
        css: 1600,
        date: "Jul 6 - Jul 12",
        docker: 4000,
        go: 4100,
        html: 1800,
        json: 4000,
        originalDate: "Jul 6 - Jul 12",
        python: 4100,
        rust: 4300,
        sql: 3500,
        timeSpent: 44900,
        typescript: 14200,
        yaml: 3300,
      },
      {
        c: 5400,
        date: "Jul 13 - Jul 19",
        docker: 4600,
        go: 3300,
        javascript: 8100,
        json: 3500,
        originalDate: "Jul 13 - Jul 19",
        python: 3600,
        rust: 5800,
        sql: 3100,
        timeSpent: 45100,
        typescript: 5000,
        yaml: 2700,
      },
      {
        css: 1600,
        date: "Jul 20 - Jul 26",
        docker: 3000,
        go: 5500,
        html: 1800,
        json: 3000,
        originalDate: "Jul 20 - Jul 26",
        python: 3300,
        rust: 6200,
        sql: 4200,
        timeSpent: 46400,
        typescript: 14900,
        yaml: 2900,
      },
      {
        date: "Jul 27 - Jul 31",
        javascript: 3500,
        json: 4500,
        originalDate: "Jul 27 - Jul 31",
        typescript: 5200,
        python: 3300,
        timeSpent: 20100,
        yaml: 3600,
      },
    ];

    const periodLanguagesGroupedByWeeks = getPeriodLanguagesGroupedByWeeks(
      mockedEntry,
      "month",
    );

    expect(periodLanguagesGroupedByWeeks).toBeDefined();
    expect(periodLanguagesGroupedByWeeks).toEqual(mockedOutput);
  });
});
