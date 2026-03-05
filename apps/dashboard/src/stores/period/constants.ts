import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";

import { getLocaleDate } from "@repo/common/get-locale-date";
import { GroupBy } from "@repo/common/types-schemas";

export const PERIODS = [
  "Last 7 days",
  "This week",
  "Last week",
  "Last 14 days",
  "Last 2 weeks",
  "This month",
  "Last month",
  "This year",
  "Last year",
  "Custom Range",
] as const;

export const PERIODS_CONFIG = {
  "Last 7 days": {
    start: getLocaleDate(subDays(new Date(), 6)),
    end: getLocaleDate(new Date()),
  },
  "This week": {
    start: getLocaleDate(startOfWeek(new Date())),
    end: getLocaleDate(new Date()),
  },
  "Last week": {
    start: getLocaleDate(startOfWeek(subWeeks(new Date(), 1))),
    end: getLocaleDate(endOfWeek(subWeeks(new Date(), 1))),
  },
  "Last 14 days": {
    start: getLocaleDate(subDays(new Date(), 13)),
    end: getLocaleDate(new Date()),
  },
  "Last 2 weeks": {
    start: getLocaleDate(startOfWeek(subWeeks(new Date(), 2))),
    end: getLocaleDate(endOfWeek(subWeeks(new Date(), 1))),
  },
  "This month": {
    start: getLocaleDate(startOfMonth(new Date())),
    end: getLocaleDate(new Date()),
  },
  "Last month": {
    start: getLocaleDate(startOfMonth(subMonths(new Date(), 1))),
    end: getLocaleDate(endOfMonth(subMonths(new Date(), 1))),
  },
  "This year": {
    start: getLocaleDate(startOfYear(new Date())),
    end: getLocaleDate(new Date()),
  },
  "Last year": {
    start: getLocaleDate(startOfYear(subYears(new Date(), 1))),
    end: getLocaleDate(endOfYear(subYears(new Date(), 1))),
  },
  "Custom Range": {
    start: getLocaleDate(new Date()),
    end: getLocaleDate(new Date()),
  },
} as const;

export const GROUP_BY_DROPDOWN_ITEMS: {
  groupBy: GroupBy;
  text: string;
}[] = [
  { groupBy: "days", text: "Days" },
  { groupBy: "weeks", text: "Weeks" },
  { groupBy: "months", text: "Months" },
];
