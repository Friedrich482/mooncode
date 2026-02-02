import { format } from "date-fns";

export const convertToISODate = (date: Date | string) => {
  return format(date, "yyyy-MM-dd");
};

