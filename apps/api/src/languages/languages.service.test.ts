import { beforeEach, describe, expect, it, vi } from "vitest";

import { MockedDrizzle } from "@/common/tests/types";
import { DrizzleAsyncProvider } from "@/drizzle/drizzle.provider";
import { Test } from "@nestjs/testing";

import { LanguagesService } from "./languages.service";

describe("languagesService", () => {
  let languagesService: LanguagesService;

  let mockedDrizzle: MockedDrizzle;

  beforeEach(async () => {
    mockedDrizzle = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn(),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      orderBy: vi.fn(),
    };

    vi.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        LanguagesService,
        {
          provide: DrizzleAsyncProvider,
          useValue: mockedDrizzle,
        },
      ],
    }).compile();

    languagesService = moduleRef.get(LanguagesService);
  });

  describe("create", () => {
    it("should return the created language", async () => {
      const mockedLanguageFields = {
        dailyDataId: "1",
        languageSlug: "typescript",
        timeSpent: 100,
      };

      const mockedCreatedLanguage = {
        languageSlug: "typescript",
        timeSpent: 100,
      };

      mockedDrizzle.returning.mockResolvedValue([mockedCreatedLanguage]);

      const createdLanguage =
        await languagesService.create(mockedLanguageFields);

      expect(createdLanguage).toBeDefined();
      expect(createdLanguage).toEqual(mockedCreatedLanguage);
    });
  });

  describe("findAll", () => {
    it("should return all the languages found for the dailyData id provided", async () => {
      const mockedFoundLanguages = {
        typescript: 400,
        json: 200,
        css: 300,
        python: 250,
        "github-actions-workflow": 100,
      };

      mockedDrizzle.orderBy.mockResolvedValue([
        {
          languageSlug: "typescript",
          timeSpent: 400,
        },
        {
          languageSlug: "json",
          timeSpent: 200,
        },
        {
          languageSlug: "css",
          timeSpent: 300,
        },
        {
          languageSlug: "python",
          timeSpent: 250,
        },
        {
          languageSlug: "github-actions-workflow",
          timeSpent: 100,
        },
      ]);

      const foundLanguages = await languagesService.findAll({
        dailyDataId: "1",
      });

      expect(foundLanguages).toBeDefined();
      expect(foundLanguages).toEqual(mockedFoundLanguages);
    });
  });

  describe("findOne", () => {
    const languageSlug = "typescript";
    const mockedLanguageFields = {
      dailyDataId: "1",
      languageSlug,
    };

    it("should return the language found", async () => {
      const mockedFoundLanguage = {
        timeSpent: 500,
        languageSlug,
        languageId: "2",
      };

      mockedDrizzle.where.mockResolvedValue([mockedFoundLanguage]);

      const foundLanguage =
        await languagesService.findOne(mockedLanguageFields);

      expect(foundLanguage).toBeDefined();
      expect(foundLanguage).toEqual(mockedFoundLanguage);
    });

    it("should return null when the language is not found", async () => {
      mockedDrizzle.where.mockResolvedValue([]);

      const foundLanguage =
        await languagesService.findOne(mockedLanguageFields);

      expect(foundLanguage).toBeNull();
    });
  });

  describe("update", () => {
    it("should return the updated language", async () => {
      const mockedLanguageFields = {
        timeSpent: 500,
        languageSlug: "typescript",
        dailyDataId: "1",
      };

      const mockedUpdatedLanguage = {
        languageSlug: "typescript",
        timeSpent: 300,
      };

      mockedDrizzle.returning.mockResolvedValue([mockedUpdatedLanguage]);

      const updatedLanguage =
        await languagesService.update(mockedLanguageFields);

      expect(updatedLanguage).toBeDefined();
      expect(updatedLanguage).toEqual(mockedUpdatedLanguage);
    });
  });
});
