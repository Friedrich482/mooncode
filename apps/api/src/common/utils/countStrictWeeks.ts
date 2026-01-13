import { addDays, endOfWeek, isBefore, isEqual, startOfWeek } from "date-fns";

const countStrictWeeks = (start: Date, end: Date) => {
  let weeks = 0;

  // Create a copy to avoid mutating the input date
  let current = startOfWeek(new Date(start));
  const endDate = new Date(end);

  while (isBefore(current, endDate) || isEqual(current, endDate)) {
    weeks++;
    const weekEnd = endOfWeek(current);
    current = startOfWeek(addDays(weekEnd, 1));
  }

  return weeks;
};

export default countStrictWeeks;
