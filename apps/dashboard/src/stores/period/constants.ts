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

import { DATE_LOCALE } from "@repo/common/constants";
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
    start: subDays(new Date(), 6).toLocaleDateString(DATE_LOCALE),
    end: new Date().toLocaleDateString(DATE_LOCALE),
  },
  "This week": {
    start: startOfWeek(new Date()).toLocaleDateString(DATE_LOCALE),
    end: new Date().toLocaleDateString(DATE_LOCALE),
  },
  "Last week": {
    start: startOfWeek(subWeeks(new Date(), 1)).toLocaleDateString(DATE_LOCALE),
    end: endOfWeek(subWeeks(new Date(), 1)).toLocaleDateString(DATE_LOCALE),
  },
  "Last 14 days": {
    start: subDays(new Date(), 13).toLocaleDateString(DATE_LOCALE),
    end: new Date().toLocaleDateString(DATE_LOCALE),
  },
  "Last 2 weeks": {
    start: startOfWeek(subWeeks(new Date(), 2)).toLocaleDateString(DATE_LOCALE),
    end: endOfWeek(subWeeks(new Date(), 1)).toLocaleDateString(DATE_LOCALE),
  },
  "This month": {
    start: startOfMonth(new Date()).toLocaleDateString(DATE_LOCALE),
    end: new Date().toLocaleDateString(DATE_LOCALE),
  },
  "Last month": {
    start: startOfMonth(subMonths(new Date(), 1)).toLocaleDateString(
      DATE_LOCALE,
    ),
    end: endOfMonth(subMonths(new Date(), 1)).toLocaleDateString(DATE_LOCALE),
  },
  "This year": {
    start: startOfYear(new Date()).toLocaleDateString(DATE_LOCALE),
    end: new Date().toLocaleDateString(DATE_LOCALE),
  },
  "Last year": {
    start: startOfYear(subYears(new Date(), 1)).toLocaleDateString(DATE_LOCALE),
    end: endOfYear(subYears(new Date(), 1)).toLocaleDateString(DATE_LOCALE),
  },
  "Custom Range": {
    start: new Date().toLocaleDateString(DATE_LOCALE),
    end: new Date().toLocaleDateString(DATE_LOCALE),
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
