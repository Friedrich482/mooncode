import { beforeEach, describe, expect, it, vi } from "vitest";

import { getWeekDayName } from "./get-weekday-name";

describe("getWeekDayName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return Sunday", () => {
    const sunday = getWeekDayName("2026-06-28");

    expect(sunday).toEqual("Sunday");
  });

  it("should return Monday", () => {
    const monday = getWeekDayName("2026-06-29");

    expect(monday).toEqual("Monday");
  });

  it("should return Tuesday", () => {
    const tuesday = getWeekDayName("2026-06-30");

    expect(tuesday).toEqual("Tuesday");
  });

  it("should return Wednesday", () => {
    const wednesday = getWeekDayName("2026-07-01");

    expect(wednesday).toEqual("Wednesday");
  });

  it("should return Thursday", () => {
    const thursday = getWeekDayName("2026-07-02");

    expect(thursday).toEqual("Thursday");
  });

  it("should return Friday", () => {
    const friday = getWeekDayName("2026-07-03");

    expect(friday).toEqual("Friday");
  });

  it("should return Saturday", () => {
    const saturday = getWeekDayName("2026-07-04");

    expect(saturday).toEqual("Saturday");
  });
});
