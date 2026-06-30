import { beforeEach, describe, expect, it, vi } from "vitest";

import { countStrictWeeks } from "./count-strict-weeks";

describe("countStrictWeeks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 1 when the start and end are in an incomplete week", () => {
    const start = "2026-06-23";
    const end = "2026-06-26";

    const weeks = countStrictWeeks(start, end);

    expect(weeks).toBeDefined();
    expect(weeks).toEqual(1);
  });

  it("should return the strict number of weeks between the start and end dates taking in account incomplete weeks", () => {
    const start = "2026-06-17";
    const end = "2026-06-21";

    const weeks = countStrictWeeks(start, end);

    expect(weeks).toBeDefined();
    expect(weeks).toEqual(2);
  });

  it("should return the strict number of weeks between the start and end dates if both the start and end are not at the perfect start or end of a week", () => {
    const start = "2026-06-17";
    const end = "2026-06-30";

    const weeks = countStrictWeeks(start, end);

    expect(weeks).toBeDefined();
    expect(weeks).toEqual(3);
  });

  it("should return the exact number of weeks when the start and end match perfectly a full week", () => {
    const start = "2026-06-21";
    const end = "2026-06-27";

    const weeks = countStrictWeeks(start, end);

    expect(weeks).toBeDefined();
    expect(weeks).toEqual(1);
  });

  it("should return the exact number of weeks when the start and end match perfectly the start and end of a week", () => {
    const start = "2026-06-02";
    const end = "2026-06-27";

    const weeks = countStrictWeeks(start, end);

    expect(weeks).toBeDefined();
    expect(weeks).toEqual(4);
  });
});
