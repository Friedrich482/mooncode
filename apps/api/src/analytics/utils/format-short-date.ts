import { format } from "date-fns";

export const formatShortDate = (date: Date) => {
  return format(date, "MMM d");
};
