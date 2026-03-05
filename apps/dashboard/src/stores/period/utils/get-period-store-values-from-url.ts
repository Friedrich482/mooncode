import { z, ZodError } from "zod";

import { formatZodError } from "@repo/common/format-zod-error";
import { getLocaleDate } from "@repo/common/get-locale-date";
import { GroupBy, IsoDateSchema } from "@repo/common/types-schemas";

import { PERIODS } from "../constants";
import { Period, PeriodSchema } from "../types-schemas";

type ReturnValues = {
  period: Period;
  groupBy: GroupBy;
  customRange: {
    start: string;
    end: string;
  };
};

export const getPeriodStoreValuesFromURL = (): ReturnValues => {
  // Default values
  const defaults: ReturnValues = {
    period: "Last 7 days",
    groupBy: "days",
    customRange: {
      start: getLocaleDate(new Date()),
      end: getLocaleDate(new Date()),
    },
  };

  try {
    const searchParams = new URLSearchParams(window.location.search);
    const periodParam = searchParams.get("period");
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");
    const groupByParam = searchParams.get("groupBy");

    // Handle groupBy parameter
    let groupBy = defaults.groupBy;
    if (groupByParam) {
      try {
        const groupBySchema = z.enum(["weeks", "months"]);
        groupBy = groupBySchema.parse(groupByParam);
      } catch {
        console.error(
          `Invalid groupBy parameter: ${groupByParam}. Defaulting to ${defaults.groupBy}`,
        );
      }
    }

    // Handle period-based parameters
    if (periodParam && PERIODS.includes(periodParam as Period)) {
      try {
        const period = PeriodSchema.parse(periodParam);
        return {
          period,
          customRange: defaults.customRange,
          groupBy,
        };
      } catch (error) {
        console.error(
          `${error instanceof ZodError ? formatZodError(error) : error}. Defaulting to ${defaults.period}`,
        );
        return {
          period: defaults.period,
          customRange: defaults.customRange,
          groupBy,
        };
      }
    }

    // Handle custom range parameters
    if (startParam && endParam) {
      try {
        const parsedStart = IsoDateSchema.parse(startParam);
        const parsedEnd = IsoDateSchema.parse(endParam);

        const validStartFromUrl = getLocaleDate(parsedStart);
        const validEndFromUrl = getLocaleDate(parsedEnd);

        return {
          period: "Custom Range",
          customRange: {
            start: validStartFromUrl,
            end: validEndFromUrl,
          },
          groupBy,
        };
      } catch (error) {
        console.error(
          `Invalid date parameters. Defaulting to ${defaults.period}`,
          error,
        );
        return {
          period: defaults.period,
          customRange: defaults.customRange,
          groupBy,
        };
      }
    }

    // Return defaults if no valid parameters were found
    return defaults;
  } catch (error) {
    console.error("Error parsing URL parameters:", error);
    return defaults;
  }
};
