export const getWeekDayName = (date: string) => {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
    new Date(date),
  );
};
