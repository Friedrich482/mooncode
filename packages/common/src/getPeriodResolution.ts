import { differenceInDays } from "date-fns";

import { PeriodResolution } from "./types-schemas";

const getPeriodResolution = (
  start: string | Date,
  end: string | Date
): PeriodResolution => {
  const numberOfDays = Math.abs(differenceInDays(start, end));
  const periodResolution =
    numberOfDays < 7
      ? "day"
      : numberOfDays < 31
        ? "week"
        : numberOfDays < 365
          ? "month"
          : "year";

  return periodResolution;
};

export default getPeriodResolution;
