import { beforeEach, describe, expect, it, vi } from "vitest";

import { formatShortDate } from "./format-short-date";

describe("formatShortDate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return the date under the format MMM d", () => {
    const shortDate = formatShortDate(new Date("2026-06-30"));

    expect(shortDate).toBeDefined();
    expect(shortDate).toEqual("Jun 30");
  });

  it("should use a single digit for the single digit days", () => {
    const shortDate = formatShortDate(new Date("2026-06-03"));

    expect(shortDate).toBeDefined();
    expect(shortDate).toEqual("Jun 3");
  });
});
