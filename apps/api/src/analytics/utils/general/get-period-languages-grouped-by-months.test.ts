import { describe, expect, it } from "vitest";

import { getPeriodLanguagesGroupedByMonths } from "./get-period-languages-grouped-by-months";

describe("getPeriodLanguagesGroupedByMonths", () => {
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
        date: "2026-05-12",
        languages: { rust: 2500, typescript: 2000 },
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
        c: 4400,
        css: 4200,
        date: "May 1 - May 31",
        docker: 4100,
        go: 12400,
        html: 4300,
        javascript: 11400,
        json: 7200,
        originalDate: "May 1 - May 31",
        python: 17700,
        rust: 16700,
        sql: 8800,
        timeSpent: 129200,
        typescript: 28200,
        yaml: 9800,
      },
      {
        c: 11100,
        css: 2300,
        date: "Jun 1 - Jun 21",
        docker: 18600,
        go: 9800,
        html: 2400,
        javascript: 8300,
        json: 15000,
        originalDate: "Jun 1 - Jun 21",
        python: 5100,
        rust: 11400,
        sql: 6100,
        timeSpent: 139300,
        typescript: 27200,
        yaml: 22000,
      },
    ];

    const periodLanguagesGroupedByMonths =
      getPeriodLanguagesGroupedByMonths(mockedEntry);

    expect(periodLanguagesGroupedByMonths).toBeDefined();
    expect(periodLanguagesGroupedByMonths).toEqual(mockedOutput);
  });
});
