import { describe, expect, it } from "vitest";

import { generateVerificationCode } from "./generate-verification-code";

describe("generateVerificationCode", () => {
  it("should return a 8 characters long random code", () => {
    const code = generateVerificationCode();

    expect(code).toBeDefined();
    expect(code).toHaveLength(8);
  });
});
