import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { DailyDataService } from "@/daily-data/daily-data.service";
import { FilesService } from "@/files/files.service";
import { LanguagesService } from "@/languages/languages.service";
import { ProjectsService } from "@/projects/projects.service";
import { Test } from "@nestjs/testing";
import { Procedure } from "@vitest/spy";

import { ExtensionService } from "./extension.service";

describe("ExtensionService", () => {
  let extensionService: ExtensionService;

  let dailyDataService: {
    findOne: Mock<Procedure>;
    update: Mock<Procedure>;
    create: Mock<Procedure>;
  };

  let languagesService: {
    findAll: Mock<Procedure>;
    findOne: Mock<Procedure>;
    update: Mock<Procedure>;
    create: Mock<Procedure>;
  };

  let projectsService: {
    findOne: Mock<Procedure>;
  };

  let filesService: {
    findAllOnDay: Mock<Procedure>;
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    dailyDataService = {
      findOne: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    };

    languagesService = {
      findAll: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    };

    projectsService = {
      findOne: vi.fn(),
    };

    filesService = {
      findAllOnDay: vi.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ExtensionService,
        { provide: DailyDataService, useValue: dailyDataService },
        { provide: LanguagesService, useValue: languagesService },
        { provide: ProjectsService, useValue: projectsService },
        { provide: FilesService, useValue: filesService },
      ],
    }).compile();

    extensionService = moduleRef.get(ExtensionService);
  });

  describe("getLanguagesTimeForDay", () => {
    const mockedEntry = {
      userId: "1",
      dateString: "2026-06-20",
    };

    it("should return the time spent on the provided day", async () => {
      const mockedTimeSpent = 10000;
      const mockedDayLanguagesTime = {
        rust: 8000,
        typescript: 2000,
      };

      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: mockedTimeSpent,
      });

      languagesService.findAll.mockResolvedValue(mockedDayLanguagesTime);

      const { timeSpent } =
        await extensionService.getLanguagesTimeForDay(mockedEntry);

      expect(timeSpent).toBeDefined();
      expect(timeSpent).toEqual(mockedTimeSpent);
    });

    it("should return the time spent for each language on the provided day", async () => {
      const mockedTimeSpent = 10000;
      const mockedDayLanguagesTime = {
        rust: 8000,
        typescript: 2000,
      };

      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: mockedTimeSpent,
      });

      languagesService.findAll.mockResolvedValue(mockedDayLanguagesTime);

      const { dayLanguagesTime } =
        await extensionService.getLanguagesTimeForDay(mockedEntry);

      expect(dayLanguagesTime).toBeDefined();
      expect(dayLanguagesTime).toEqual(mockedDayLanguagesTime);
    });

    it("should return an empty state if there is no data on the provided day", async () => {
      dailyDataService.findOne.mockResolvedValue(null);

      const { timeSpent, dayLanguagesTime } =
        await extensionService.getLanguagesTimeForDay(mockedEntry);

      expect(timeSpent).toBeDefined();
      expect(timeSpent).toEqual(0);

      expect(dayLanguagesTime).toBeDefined();
      expect(dayLanguagesTime).toEqual({});
    });
  });

  describe("getFilesForDay", () => {
    const mockedEntry = {
      userId: "1",
      dateString: "2026-06-20",
    };

    it("should return data about each file on the provided day", async () => {
      const mockedTimeSpent = 10000;
      const mockedFilesData = {
        "/home/user/projects/mooncode/apps/api/package.json": {
          languageSlug: "json",
          timeSpent: 600,
          fileName: "package.json",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
        },
        "/home/user/projects/mooncode/apps/api/main.ts": {
          languageSlug: "typescript",
          timeSpent: 2000,
          fileName: "main.ts",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
        },
        "/home/user/projects/factory/Dockerfile": {
          languageSlug: "docker",
          timeSpent: 1200,
          fileName: "Dockerfile",
          projectName: "factory",
          projectPath: "/home/user/projects/factory",
        },
      };

      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: mockedTimeSpent,
      });

      filesService.findAllOnDay.mockResolvedValue(mockedFilesData);

      const filesData = await extensionService.getFilesForDay(mockedEntry);

      expect(filesData).toBeDefined();
      expect(filesData).toEqual(mockedFilesData);
    });

    it("should return an empty state if there is no files data on the provided day", async () => {
      dailyDataService.findOne.mockResolvedValue(null);

      const filesData = await extensionService.getFilesForDay(mockedEntry);

      expect(filesData).toBeDefined();
      expect(filesData).toEqual({});
    });
  });

  describe("upsertLanguages", () => {
    it("should return the time spent on the day", async () => {
      const timeSpentPerLanguage = {
        rust: 8000,
        typescript: 2000,
      };
      const timeSpentOnDay = 10000;
      const targetedDate = "2026-06-20";

      const mockedEntry = {
        timeSpentPerLanguage,
        timeSpentOnDay,
        targetedDate,
        userId: "1",
      };

      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: 9940,
      });

      dailyDataService.update.mockResolvedValue({
        timeSpent: timeSpentOnDay,
        id: "2",
        date: targetedDate,
      });

      languagesService.findOne
        .mockResolvedValueOnce({
          timeSpent: 7970,
          languageSlug: "rust",
          languageId: "3",
        })
        .mockResolvedValue({
          timeSpent: 1970,
          languageSlug: "typescript",
          languageId: "4",
        });

      languagesService.update
        .mockResolvedValueOnce({
          languageSlug: Object.keys(timeSpentPerLanguage)[0],
          timeSpent: Object.values(timeSpentPerLanguage)[0],
        })
        .mockResolvedValueOnce({
          languageSlug: Object.keys(timeSpentPerLanguage)[1],
          timeSpent: Object.values(timeSpentPerLanguage)[1],
        });

      const { timeSpentOnDay: timeSpent } =
        await extensionService.upsertLanguages(mockedEntry);

      expect(timeSpent).toBeDefined();
      expect(timeSpent).toEqual(timeSpentOnDay);
    });

    it("should return the date of the day", async () => {
      const timeSpentPerLanguage = {
        rust: 8000,
        typescript: 2000,
      };
      const timeSpentOnDay = 10000;
      const targetedDate = "2026-06-20";

      const mockedEntry = {
        timeSpentPerLanguage,
        timeSpentOnDay,
        targetedDate,
        userId: "1",
      };

      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: 9940,
      });

      dailyDataService.update.mockResolvedValue({
        timeSpent: timeSpentOnDay,
        id: "2",
        date: targetedDate,
      });

      languagesService.findOne
        .mockResolvedValueOnce({
          timeSpent: 7970,
          languageSlug: "rust",
          languageId: "3",
        })
        .mockResolvedValue({
          timeSpent: 1970,
          languageSlug: "typescript",
          languageId: "4",
        });

      languagesService.update
        .mockResolvedValueOnce({
          languageSlug: Object.keys(timeSpentPerLanguage)[0],
          timeSpent: Object.values(timeSpentPerLanguage)[0],
        })
        .mockResolvedValueOnce({
          languageSlug: Object.keys(timeSpentPerLanguage)[1],
          timeSpent: Object.values(timeSpentPerLanguage)[1],
        });

      const { date } = await extensionService.upsertLanguages(mockedEntry);

      expect(date).toBeDefined();
      expect(date).toEqual(targetedDate);
    });

    it("should return the updated languages for the day", async () => {
      const timeSpentPerLanguage = {
        rust: 8000,
        typescript: 2000,
      };
      const timeSpentOnDay = 10000;
      const targetedDate = "2026-06-20";

      const mockedEntry = {
        timeSpentPerLanguage,
        timeSpentOnDay,
        targetedDate,
        userId: "1",
      };

      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: 9940,
      });

      dailyDataService.update.mockResolvedValue({
        timeSpent: timeSpentOnDay,
        id: "2",
        date: targetedDate,
      });

      languagesService.findOne
        .mockResolvedValueOnce({
          timeSpent: 7970,
          languageSlug: "rust",
          languageId: "3",
        })
        .mockResolvedValue({
          timeSpent: 1970,
          languageSlug: "typescript",
          languageId: "4",
        });

      languagesService.update
        .mockResolvedValueOnce({
          languageSlug: Object.keys(timeSpentPerLanguage)[0],
          timeSpent: Object.values(timeSpentPerLanguage)[0],
        })
        .mockResolvedValueOnce({
          languageSlug: Object.keys(timeSpentPerLanguage)[1],
          timeSpent: Object.values(timeSpentPerLanguage)[1],
        });

      const { languages } = await extensionService.upsertLanguages(mockedEntry);

      expect(languages).toBeDefined();
      expect(languages).toEqual(timeSpentPerLanguage);
    });

    it("should create the data for the day if it doesn't exist", async () => {
      const timeSpentPerLanguage = {
        rust: 8000,
        typescript: 2000,
      };
      const timeSpentOnDay = 10000;
      const targetedDate = "2026-06-20";

      const mockedEntry = {
        timeSpentPerLanguage,
        timeSpentOnDay,
        targetedDate,
        userId: "1",
      };

      dailyDataService.findOne.mockResolvedValue(null);

      dailyDataService.create.mockResolvedValue({
        timeSpent: timeSpentOnDay,
        id: "2",
        date: targetedDate,
      });

      languagesService.findOne
        .mockResolvedValueOnce({
          timeSpent: 7970,
          languageSlug: "rust",
          languageId: "3",
        })
        .mockResolvedValue({
          timeSpent: 1970,
          languageSlug: "typescript",
          languageId: "4",
        });

      languagesService.update
        .mockResolvedValueOnce({
          languageSlug: Object.keys(timeSpentPerLanguage)[0],
          timeSpent: Object.values(timeSpentPerLanguage)[0],
        })
        .mockResolvedValueOnce({
          languageSlug: Object.keys(timeSpentPerLanguage)[1],
          timeSpent: Object.values(timeSpentPerLanguage)[1],
        });

      const {
        timeSpentOnDay: timeSpent,
        date,
        dailyDataId,
      } = await extensionService.upsertLanguages(mockedEntry);

      expect(timeSpent).toBeDefined();
      expect(timeSpent).toEqual(timeSpentOnDay);

      expect(date).toBeDefined();
      expect(date).toEqual(targetedDate);

      expect(dailyDataId).toBeDefined();
      expect(dailyDataId).toEqual("2");

      expect(dailyDataService.create).toHaveBeenCalled();
      expect(dailyDataService.create).toHaveBeenCalledWith({
        targetedDate,
        timeSpent: timeSpentOnDay,
        userId: mockedEntry.userId,
      });
    });

    it("should update the data for the day if it exists and the new time spent is greater than the old one", async () => {
      const timeSpentPerLanguage = {
        rust: 8000,
        typescript: 2000,
      };
      const timeSpentOnDay = 10000;
      const targetedDate = "2026-06-20";

      const mockedEntry = {
        timeSpentPerLanguage,
        timeSpentOnDay,
        targetedDate,
        userId: "1",
      };

      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: 9940,
      });

      dailyDataService.update.mockResolvedValue({
        timeSpent: timeSpentOnDay,
        id: "2",
        date: targetedDate,
      });

      languagesService.findOne
        .mockResolvedValueOnce({
          timeSpent: 7970,
          languageSlug: "rust",
          languageId: "3",
        })
        .mockResolvedValue({
          timeSpent: 1970,
          languageSlug: "typescript",
          languageId: "4",
        });

      languagesService.update
        .mockResolvedValueOnce({
          languageSlug: Object.keys(timeSpentPerLanguage)[0],
          timeSpent: Object.values(timeSpentPerLanguage)[0],
        })
        .mockResolvedValueOnce({
          languageSlug: Object.keys(timeSpentPerLanguage)[1],
          timeSpent: Object.values(timeSpentPerLanguage)[1],
        });

      const {
        timeSpentOnDay: timeSpent,
        date,
        dailyDataId,
      } = await extensionService.upsertLanguages(mockedEntry);

      expect(timeSpent).toBeDefined();
      expect(timeSpent).toEqual(timeSpentOnDay);

      expect(date).toBeDefined();
      expect(date).toEqual(targetedDate);

      expect(dailyDataId).toBeDefined();
      expect(dailyDataId).toEqual("2");

      expect(dailyDataService.update).toHaveBeenCalled();
      expect(dailyDataService.update).toHaveBeenCalledWith({
        targetedDate,
        timeSpent: timeSpentOnDay,
        userId: mockedEntry.userId,
      });
    });

    it("should NOT update the data for the day if it exists and the new time spent is less than the old one", async () => {
      const timeSpentPerLanguage = {
        rust: 7000,
        typescript: 1000,
      };
      const timeSpentOnDay = 8000;
      const targetedDate = "2026-06-20";

      const mockedEntry = {
        timeSpentPerLanguage,
        timeSpentOnDay,
        targetedDate,
        userId: "1",
      };

      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: 9940,
      });

      languagesService.findOne
        .mockResolvedValueOnce({
          timeSpent: 7970,
          languageSlug: "rust",
          languageId: "3",
        })
        .mockResolvedValue({
          timeSpent: 1970,
          languageSlug: "typescript",
          languageId: "4",
        });

      const {
        timeSpentOnDay: timeSpent,
        date,
        dailyDataId,
      } = await extensionService.upsertLanguages(mockedEntry);

      expect(timeSpent).toBeDefined();
      expect(timeSpent).toEqual(9940);

      expect(date).toBeDefined();
      expect(date).toEqual(targetedDate);

      expect(dailyDataId).toBeDefined();
      expect(dailyDataId).toEqual("2");

      expect(dailyDataService.update).not.toHaveBeenCalled();
    });

    it("should create the data of the language for the day if it doesn't exist", async () => {
      const timeSpentPerLanguage = {
        rust: 8000,
        typescript: 2000,
      };
      const timeSpentOnDay = 10000;
      const targetedDate = "2026-06-20";

      const mockedEntry = {
        timeSpentPerLanguage,
        timeSpentOnDay,
        targetedDate,
        userId: "1",
      };

      dailyDataService.findOne.mockResolvedValue(null);

      dailyDataService.create.mockResolvedValue({
        timeSpent: timeSpentOnDay,
        id: "2",
        date: targetedDate,
      });

      languagesService.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValue(null);

      languagesService.create
        .mockResolvedValueOnce({
          languageSlug: Object.keys(timeSpentPerLanguage)[0],
          timeSpent: Object.values(timeSpentPerLanguage)[0],
        })
        .mockResolvedValueOnce({
          languageSlug: Object.keys(timeSpentPerLanguage)[1],
          timeSpent: Object.values(timeSpentPerLanguage)[1],
        });

      const { languages } = await extensionService.upsertLanguages(mockedEntry);

      expect(languages).toBeDefined();
      expect(languages).toEqual(timeSpentPerLanguage);

      expect(languagesService.create).toHaveBeenCalledTimes(2);
      expect(languagesService.create).toHaveBeenNthCalledWith(1, {
        languageSlug: Object.keys(timeSpentPerLanguage)[0],
        timeSpent: Object.values(timeSpentPerLanguage)[0],
        dailyDataId: "2",
      });
      expect(languagesService.create).toHaveBeenNthCalledWith(2, {
        languageSlug: Object.keys(timeSpentPerLanguage)[1],
        timeSpent: Object.values(timeSpentPerLanguage)[1],
        dailyDataId: "2",
      });
    });

    it("should update the data of the language for the day if it exists and the new time spent on the language is greater than the old one", async () => {
      const timeSpentPerLanguage = {
        rust: 8000,
        typescript: 2000,
      };
      const timeSpentOnDay = 10000;
      const targetedDate = "2026-06-20";

      const mockedEntry = {
        timeSpentPerLanguage,
        timeSpentOnDay,
        targetedDate,
        userId: "1",
      };

      dailyDataService.findOne.mockResolvedValue({
        timeSpent: 9940,
        id: "2",
      });

      dailyDataService.update.mockResolvedValue({
        timeSpent: timeSpentOnDay,
        id: "2",
        date: targetedDate,
      });

      languagesService.findOne
        .mockResolvedValueOnce({
          timeSpent: 7970,
          languageSlug: "rust",
          languageId: "3",
        })
        .mockResolvedValue({
          timeSpent: 1970,
          languageSlug: "typescript",
          languageId: "4",
        });

      languagesService.update
        .mockResolvedValueOnce({
          languageSlug: Object.keys(timeSpentPerLanguage)[0],
          timeSpent: Object.values(timeSpentPerLanguage)[0],
        })
        .mockResolvedValueOnce({
          languageSlug: Object.keys(timeSpentPerLanguage)[1],
          timeSpent: Object.values(timeSpentPerLanguage)[1],
        });

      const { languages } = await extensionService.upsertLanguages(mockedEntry);

      expect(languages).toBeDefined();
      expect(languages).toEqual(timeSpentPerLanguage);

      expect(languagesService.update).toHaveBeenCalledTimes(2);
      expect(languagesService.update).toHaveBeenNthCalledWith(1, {
        languageSlug: Object.keys(timeSpentPerLanguage)[0],
        timeSpent: Object.values(timeSpentPerLanguage)[0],
        dailyDataId: "2",
      });
      expect(languagesService.update).toHaveBeenNthCalledWith(2, {
        languageSlug: Object.keys(timeSpentPerLanguage)[1],
        timeSpent: Object.values(timeSpentPerLanguage)[1],
        dailyDataId: "2",
      });
    });

    it("should NOT update the data of the language for the day if it exists and the new time spent on the language is less than the old one", async () => {
      const timeSpentPerLanguage = {
        rust: 7000,
        typescript: 1000,
      };
      const timeSpentOnDay = 8000;
      const targetedDate = "2026-06-20";

      const mockedEntry = {
        timeSpentPerLanguage,
        timeSpentOnDay,
        targetedDate,
        userId: "1",
      };

      dailyDataService.findOne.mockResolvedValue({
        timeSpent: 9940,
        id: "2",
      });

      languagesService.findOne
        .mockResolvedValueOnce({
          timeSpent: 7970,
          languageSlug: "rust",
          languageId: "3",
        })
        .mockResolvedValue({
          timeSpent: 1970,
          languageSlug: "typescript",
          languageId: "4",
        });

      const { languages } = await extensionService.upsertLanguages(mockedEntry);

      expect(languages).toBeDefined();
      expect(languages).toEqual({ rust: 7970, typescript: 1970 });

      expect(languagesService.update).not.toHaveBeenCalled();
    });

    it("should ONLY update the data for the languages of the day if that data exists and the new time spent on the language is greater than the old one", async () => {
      const timeSpentPerLanguage = {
        rust: 9000,
        typescript: 1000,
      };
      const timeSpentOnDay = 10000;
      const targetedDate = "2026-06-20";

      const mockedEntry = {
        timeSpentPerLanguage,
        timeSpentOnDay,
        targetedDate,
        userId: "1",
      };

      dailyDataService.findOne.mockResolvedValue({
        timeSpent: 9940,
        id: "2",
      });

      dailyDataService.update.mockResolvedValue({
        timeSpent: timeSpentOnDay,
        id: "2",
        date: targetedDate,
      });

      languagesService.findOne
        .mockResolvedValueOnce({
          timeSpent: 7970,
          languageSlug: "rust",
          languageId: "3",
        })
        .mockResolvedValue({
          timeSpent: 1970,
          languageSlug: "typescript",
          languageId: "4",
        });

      languagesService.update.mockResolvedValueOnce({
        languageSlug: Object.keys(timeSpentPerLanguage)[0],
        timeSpent: Object.values(timeSpentPerLanguage)[0],
      });

      const { languages } = await extensionService.upsertLanguages(mockedEntry);

      expect(languages).toBeDefined();
      expect(languages).toEqual({ rust: 9000, typescript: 1970 });

      expect(languagesService.update).toHaveBeenCalledTimes(1);
      expect(languagesService.update).toHaveBeenNthCalledWith(1, {
        languageSlug: Object.keys(timeSpentPerLanguage)[0],
        timeSpent: Object.values(timeSpentPerLanguage)[0],
        dailyDataId: "2",
      });
    });
  });
});
