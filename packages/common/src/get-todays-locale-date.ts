import { DATE_LOCALE } from "./constants";

/**
 * Returns the current date in the locale format specified in {@link DATE_LOCALE}.
 * Always give a YYYY-MM-DD format
 */
export const getTodaysLocaleDate = () => {
  return new Date().toLocaleDateString(DATE_LOCALE);
};
