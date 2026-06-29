import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";

import { BadRequestException } from "@nestjs/common";

import { ZodPipe } from "./zod.pipe";

describe("ZodPipe", () => {
  const schema = z.object({ code: z.string() });
  let zodPipe: ZodPipe<{ code: string }>;

  beforeEach(() => {
    zodPipe = new ZodPipe(schema);
  });

  describe("transform", () => {
    it("should return the data if the value passed in argument is of the expected type", () => {
      const mockedEntry = { code: "some_google_code" };

      const { code } = zodPipe.transform(mockedEntry);

      expect(code).toEqual(mockedEntry.code);
    });

    it("should throw a BadRequestException if the value doesn't match the zod schema", () => {
      const mockedEntry = { code: 123 };

      expect(() => zodPipe.transform(mockedEntry)).toThrow(BadRequestException);
      expect(() => zodPipe.transform(mockedEntry)).toThrow(/Invalid input/i);
    });
  });
});
