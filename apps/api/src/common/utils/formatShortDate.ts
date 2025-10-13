import { format } from "date-fns";

const formatShortDate = (date: Date) => {
  return format(date, "MMM d");
};

export default formatShortDate;
