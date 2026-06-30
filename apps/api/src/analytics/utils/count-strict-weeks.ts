import { differenceInWeeks, endOfWeek, startOfWeek } from "date-fns";

export const countStrictWeeks = (start: string, end: string) => {
  return differenceInWeeks(endOfWeek(end), startOfWeek(start)) + 1;
};
