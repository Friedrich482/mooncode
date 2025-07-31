import { LayoutDashboard, LucideProps, Monitor, Moon, Sun } from "lucide-react";
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
import { ChartConfig } from "@repo/ui/components/ui/chart";
import { DATE_LOCALE } from "@repo/common/constants";
import { FixedArray } from "./types-schemas";
import { GroupBy } from "@repo/common/types";
import { Theme } from "@/components/themeProvider";

export const THEME_DROPDOWN_ITEMS: {
  text: string;
  Icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  theme: Theme;
}[] = [
  { text: "Light", Icon: Sun, theme: "light" },
  { text: "Dark", Icon: Moon, theme: "dark" },
  { text: "System", Icon: Monitor, theme: "system" },
];

export const AUTH_DROPDOWN_ITEMS: {
  text: string;
  Icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  url: string;
}[] = [
  {
    text: "Dashboard",
    Icon: LayoutDashboard,
    url: "/dashboard",
  },
];

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

export const WEEK_PERIODS = ["Last 7 days", "This week", "Last week"];
export const YEAR_PERIODS = ["This year", "Last year"];

export const GROUP_BY_DROPDOWN_ITEMS: {
  groupBy: GroupBy;
  text: string;
}[] = [
  { groupBy: "days", text: "Days" },
  { groupBy: "weeks", text: "Weeks" },
  { groupBy: "months", text: "Months" },
];

export const chartConfig = {
  time: {
    label: "Time spent",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

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

export const NUMBER_OF_FILES_TO_SHOW = 30;
export const bubblesColors: FixedArray<string, typeof NUMBER_OF_FILES_TO_SHOW> =
  [
    "#D9BC55",
    "#8250CE",
    "#D96C61",
    "#4A9EB2",
    "#D99738",
    "#B25AAB",
    "#D94F80",
    "#2C9BCF",
    "#D97B49",
    "#B262CE",
    "#4A9EB2",
    "#D9804A",
    "#D95ECA",
    "#D94A91",
    "#3F9CD2",
    "#D9B04A",
    "#9973CE",
    "#859CCF",
    "#D99341",
    "#BB79CF",
    "#6A98CF",
    "#D97258",
    "#6188B2",
    "#D99E5C",
    "#A265D2",
    "#78B2D9",
    "#D9658E",
    "#907BD2",
    "#D98165",
    "#64A6D2",
  ];
