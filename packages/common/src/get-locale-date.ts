const DATE_LOCALE = "sv-SE";

/**
 * Returns the date passed in parameter in the locale format specified in {@link DATE_LOCALE}.
 * Always give a YYYY-MM-DD format
 */
export const getLocaleDate = (date: Date) => {
  return date.toLocaleDateString(DATE_LOCALE);
};
