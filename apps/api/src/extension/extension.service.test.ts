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
    update: Mock<Procedure>;
    create: Mock<Procedure>;
  };

  let filesService: {
    findAllOnDay: Mock<Procedure>;
    findOne: Mock<Procedure>;
    update: Mock<Procedure>;
    create: Mock<Procedure>;
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
      update: vi.fn(),
      create: vi.fn(),
    };

    filesService = {
      findAllOnDay: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
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
      const mockedTimeSpent = 3800;
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

  describe("upsertFiles", () => {
    it("should return the updated files", async () => {
      const mockedEntry = {
        userId: "1",
        filesData: {
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
        },
        targetedDate: "2026-06-21",
      };

      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: 3000,
      });

      projectsService.findOne
        .mockResolvedValueOnce({
          id: "3",
          name: "mooncode",
          path: "/home/user/projects/mooncode",
          timeSpent: 2000,
        })
        .mockResolvedValueOnce({
          id: "4",
          name: "factory",
          path: "/home/user/projects/factory",
          timeSpent: 1000,
        });

      projectsService.update
        .mockResolvedValueOnce({
          name: "mooncode",
          path: "/home/user/projects/mooncode",
          timeSpent: 2600,
          dailyDataId: "2",
        })
        .mockResolvedValueOnce({
          name: "factory",
          path: "/home/user/projects/factory",
          timeSpent: 1200,
          dailyDataId: "2",
        });

      filesService.findAllOnDay.mockResolvedValue({
        "/home/user/projects/mooncode/apps/api/package.json": {
          languageSlug: "json",
          timeSpent: 200,
          fileName: "package.json",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
        },
        "/home/user/projects/mooncode/apps/api/main.ts": {
          languageSlug: "typescript",
          timeSpent: 1800,
          fileName: "main.ts",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
        },
        "/home/user/projects/factory/Dockerfile": {
          languageSlug: "docker",
          timeSpent: 1000,
          fileName: "Dockerfile",
          projectName: "factory",
          projectPath: "/home/user/projects/factory",
        },
      });

      languagesService.findOne
        .mockResolvedValueOnce({
          timeSpent: 200,
          languageSlug: "json",
          languageId: "5",
        })
        .mockResolvedValueOnce({
          timeSpent: 1800,
          languageSlug: "typescript",
          languageId: "6",
        })
        .mockResolvedValue({
          timeSpent: 1000,
          languageSlug: "docker",
          languageId: "7",
        });

      filesService.findOne
        .mockResolvedValueOnce({
          name: "package.json",
          path: "/home/user/projects/mooncode/apps/api/package.json",
          timeSpent: 200,
        })
        .mockResolvedValueOnce({
          name: "main.ts",
          path: "/home/user/projects/mooncode/apps/api/main.ts",
          timeSpent: 1800,
        })
        .mockResolvedValueOnce({
          name: "Dockerfile",
          path: "/home/user/projects/factory/Dockerfile",
          timeSpent: 1000,
        });

      filesService.update
        .mockResolvedValueOnce({
          name: "package.json",
          path: "/home/user/projects/mooncode/apps/api/package.json",
          timeSpent: 600,
        })
        .mockResolvedValueOnce({
          name: "main.ts",
          path: "/home/user/projects/mooncode/apps/api/main.ts",
          timeSpent: 2000,
        })
        .mockResolvedValueOnce({
          name: "Dockerfile",
          path: "/home/user/projects/factory/Dockerfile",
          timeSpent: 1200,
        });

      const filesData = await extensionService.upsertFiles(mockedEntry);

      expect(filesData).toBeDefined();
      expect(filesData).toEqual(mockedEntry.filesData);
    });

    it("should return an empty object if the data for the day doesn't exists (impossible state)", async () => {
      const mockedEntry = {
        userId: "1",
        filesData: {
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
        },
        targetedDate: "2026-06-21",
      };

      dailyDataService.findOne.mockResolvedValue(null);

      const filesData = await extensionService.upsertFiles(mockedEntry);

      expect(filesData).toBeDefined();
      expect(filesData).toEqual({});
    });

    it("should create the project for the day if it doesn't exist", async () => {
      const mockedEntry = {
        userId: "1",
        filesData: {
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
        },
        targetedDate: "2026-06-21",
      };

      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: 3000,
      });

      projectsService.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      projectsService.create
        .mockResolvedValueOnce({
          name: "mooncode",
          path: "/home/user/projects/mooncode",
          timeSpent: 2600,
          dailyDataId: "2",
        })
        .mockResolvedValueOnce({
          name: "factory",
          path: "/home/user/projects/factory",
          timeSpent: 1200,
          dailyDataId: "2",
        });

      filesService.findAllOnDay.mockResolvedValue({});

      languagesService.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValue(null);

      filesService.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      filesService.create
        .mockResolvedValueOnce({
          name: "package.json",
          path: "/home/user/projects/mooncode/apps/api/package.json",
          timeSpent: 600,
        })
        .mockResolvedValueOnce({
          name: "main.ts",
          path: "/home/user/projects/mooncode/apps/api/main.ts",
          timeSpent: 2000,
        })
        .mockResolvedValueOnce({
          name: "Dockerfile",
          path: "/home/user/projects/factory/Dockerfile",
          timeSpent: 1200,
        });

      const filesData = await extensionService.upsertFiles(mockedEntry);

      expect(filesData).toBeDefined();
      expect(filesData).toEqual({});

      expect(projectsService.create).toHaveBeenCalled();
      expect(projectsService.create).toHaveBeenNthCalledWith(1, {
        dailyDataId: "2",
        name: "mooncode",
        path: "/home/user/projects/mooncode",
        timeSpent: 2600,
      });
      expect(projectsService.create).toHaveBeenNthCalledWith(2, {
        dailyDataId: "2",
        name: "factory",
        path: "/home/user/projects/factory",
        timeSpent: 1200,
      });
    });

    it("should update the project data for the day if it exists and the new time spent is greater than the existing one", async () => {
      const mockedEntry = {
        userId: "1",
        filesData: {
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
        },
        targetedDate: "2026-06-21",
      };

      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: 3000,
      });

      projectsService.findOne
        .mockResolvedValueOnce({
          id: "3",
          name: "mooncode",
          path: "/home/user/projects/mooncode",
          timeSpent: 2000,
        })
        .mockResolvedValueOnce({
          id: "4",
          name: "factory",
          path: "/home/user/projects/factory",
          timeSpent: 1000,
        });

      projectsService.update
        .mockResolvedValueOnce({
          name: "mooncode",
          path: "/home/user/projects/mooncode",
          timeSpent: 2600,
          dailyDataId: "2",
        })
        .mockResolvedValueOnce({
          name: "factory",
          path: "/home/user/projects/factory",
          timeSpent: 1200,
          dailyDataId: "2",
        });

      filesService.findAllOnDay.mockResolvedValue({
        "/home/user/projects/mooncode/apps/api/package.json": {
          languageSlug: "json",
          timeSpent: 200,
          fileName: "package.json",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
        },
        "/home/user/projects/mooncode/apps/api/main.ts": {
          languageSlug: "typescript",
          timeSpent: 1800,
          fileName: "main.ts",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
        },
        "/home/user/projects/factory/Dockerfile": {
          languageSlug: "docker",
          timeSpent: 1000,
          fileName: "Dockerfile",
          projectName: "factory",
          projectPath: "/home/user/projects/factory",
        },
      });

      languagesService.findOne
        .mockResolvedValueOnce({
          timeSpent: 200,
          languageSlug: "json",
          languageId: "5",
        })
        .mockResolvedValueOnce({
          timeSpent: 1800,
          languageSlug: "typescript",
          languageId: "6",
        })
        .mockResolvedValue({
          timeSpent: 1000,
          languageSlug: "docker",
          languageId: "7",
        });

      filesService.findOne
        .mockResolvedValueOnce({
          name: "package.json",
          path: "/home/user/projects/mooncode/apps/api/package.json",
          timeSpent: 200,
        })
        .mockResolvedValueOnce({
          name: "main.ts",
          path: "/home/user/projects/mooncode/apps/api/main.ts",
          timeSpent: 1800,
        })
        .mockResolvedValueOnce({
          name: "Dockerfile",
          path: "/home/user/projects/factory/Dockerfile",
          timeSpent: 1000,
        });

      filesService.update
        .mockResolvedValueOnce({
          name: "package.json",
          path: "/home/user/projects/mooncode/apps/api/package.json",
          timeSpent: 600,
        })
        .mockResolvedValueOnce({
          name: "main.ts",
          path: "/home/user/projects/mooncode/apps/api/main.ts",
          timeSpent: 2000,
        })
        .mockResolvedValueOnce({
          name: "Dockerfile",
          path: "/home/user/projects/factory/Dockerfile",
          timeSpent: 1200,
        });

      const filesData = await extensionService.upsertFiles(mockedEntry);

      expect(filesData).toBeDefined();
      expect(filesData).toEqual(mockedEntry.filesData);

      expect(projectsService.update).toHaveBeenCalled();
      expect(projectsService.update).toHaveBeenNthCalledWith(1, {
        dailyDataId: "2",
        name: "mooncode",
        path: "/home/user/projects/mooncode",
        timeSpent: 2600,
      });
      expect(projectsService.update).toHaveBeenNthCalledWith(2, {
        dailyDataId: "2",
        name: "factory",
        path: "/home/user/projects/factory",
        timeSpent: 1200,
      });
    });

    it("should NOT update the project data for the day if it exists and the new time spent is less than the existing one", async () => {
      const mockedEntry = {
        userId: "1",
        filesData: {
          "/home/user/projects/mooncode/apps/api/package.json": {
            languageSlug: "json",
            timeSpent: 400,
            fileName: "package.json",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
          },
          "/home/user/projects/mooncode/apps/api/main.ts": {
            languageSlug: "typescript",
            timeSpent: 1000,
            fileName: "main.ts",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
          },
          "/home/user/projects/factory/Dockerfile": {
            languageSlug: "docker",
            timeSpent: 800,
            fileName: "Dockerfile",
            projectName: "factory",
            projectPath: "/home/user/projects/factory",
          },
        },
        targetedDate: "2026-06-21",
      };

      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: 3300,
      });

      projectsService.findOne
        .mockResolvedValueOnce({
          id: "3",
          name: "mooncode",
          path: "/home/user/projects/mooncode",
          timeSpent: 2300,
        })
        .mockResolvedValueOnce({
          id: "4",
          name: "factory",
          path: "/home/user/projects/factory",
          timeSpent: 1000,
        });

      filesService.findAllOnDay.mockResolvedValue({
        "/home/user/projects/mooncode/apps/api/package.json": {
          languageSlug: "json",
          timeSpent: 500,
          fileName: "package.json",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
        },
        "/home/user/projects/mooncode/apps/api/main.ts": {
          languageSlug: "typescript",
          timeSpent: 1800,
          fileName: "main.ts",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
        },
        "/home/user/projects/factory/Dockerfile": {
          languageSlug: "docker",
          timeSpent: 1000,
          fileName: "Dockerfile",
          projectName: "factory",
          projectPath: "/home/user/projects/factory",
        },
      });

      languagesService.findOne
        .mockResolvedValueOnce({
          timeSpent: 500,
          languageSlug: "json",
          languageId: "5",
        })
        .mockResolvedValueOnce({
          timeSpent: 1800,
          languageSlug: "typescript",
          languageId: "6",
        })
        .mockResolvedValue({
          timeSpent: 1000,
          languageSlug: "docker",
          languageId: "7",
        });

      filesService.findOne
        .mockResolvedValueOnce({
          name: "package.json",
          path: "/home/user/projects/mooncode/apps/api/package.json",
          timeSpent: 500,
        })
        .mockResolvedValueOnce({
          name: "main.ts",
          path: "/home/user/projects/mooncode/apps/api/main.ts",
          timeSpent: 1800,
        })
        .mockResolvedValueOnce({
          name: "Dockerfile",
          path: "/home/user/projects/factory/Dockerfile",
          timeSpent: 1000,
        });

      const filesData = await extensionService.upsertFiles(mockedEntry);

      expect(filesData).toBeDefined();
      expect(filesData).toEqual({
        "/home/user/projects/mooncode/apps/api/package.json": {
          languageSlug: "json",
          timeSpent: 500,
          fileName: "package.json",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
        },
        "/home/user/projects/mooncode/apps/api/main.ts": {
          languageSlug: "typescript",
          timeSpent: 1800,
          fileName: "main.ts",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
        },
        "/home/user/projects/factory/Dockerfile": {
          languageSlug: "docker",
          timeSpent: 1000,
          fileName: "Dockerfile",
          projectName: "factory",
          projectPath: "/home/user/projects/factory",
        },
      });

      expect(projectsService.update).not.toHaveBeenCalled();
    });

    it("should ONLY update projects where the new time spent is greater than the existing one", async () => {
      const mockedEntry = {
        userId: "1",
        filesData: {
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
            timeSpent: 800,
            fileName: "Dockerfile",
            projectName: "factory",
            projectPath: "/home/user/projects/factory",
          },
        },
        targetedDate: "2026-06-21",
      };

      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: 3300,
      });

      projectsService.findOne
        .mockResolvedValueOnce({
          id: "3",
          name: "mooncode",
          path: "/home/user/projects/mooncode",
          timeSpent: 2300,
        })
        .mockResolvedValueOnce({
          id: "4",
          name: "factory",
          path: "/home/user/projects/factory",
          timeSpent: 1000,
        });

      projectsService.update.mockResolvedValueOnce({
        name: "mooncode",
        path: "/home/user/projects/mooncode",
        timeSpent: 2600,
        dailyDataId: "2",
      });

      filesService.findAllOnDay.mockResolvedValue({
        "/home/user/projects/mooncode/apps/api/package.json": {
          languageSlug: "json",
          timeSpent: 500,
          fileName: "package.json",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
        },
        "/home/user/projects/mooncode/apps/api/main.ts": {
          languageSlug: "typescript",
          timeSpent: 1800,
          fileName: "main.ts",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
        },
        "/home/user/projects/factory/Dockerfile": {
          languageSlug: "docker",
          timeSpent: 1000,
          fileName: "Dockerfile",
          projectName: "factory",
          projectPath: "/home/user/projects/factory",
        },
      });

      languagesService.findOne
        .mockResolvedValueOnce({
          timeSpent: 500,
          languageSlug: "json",
          languageId: "5",
        })
        .mockResolvedValueOnce({
          timeSpent: 1800,
          languageSlug: "typescript",
          languageId: "6",
        })
        .mockResolvedValue({
          timeSpent: 1000,
          languageSlug: "docker",
          languageId: "7",
        });

      filesService.findOne
        .mockResolvedValueOnce({
          name: "package.json",
          path: "/home/user/projects/mooncode/apps/api/package.json",
          timeSpent: 500,
        })
        .mockResolvedValueOnce({
          name: "main.ts",
          path: "/home/user/projects/mooncode/apps/api/main.ts",
          timeSpent: 1800,
        })
        .mockResolvedValueOnce({
          name: "Dockerfile",
          path: "/home/user/projects/factory/Dockerfile",
          timeSpent: 1000,
        });

      filesService.update
        .mockResolvedValueOnce({
          name: "package.json",
          path: "/home/user/projects/mooncode/apps/api/package.json",
          timeSpent: 600,
        })
        .mockResolvedValueOnce({
          name: "main.ts",
          path: "/home/user/projects/mooncode/apps/api/main.ts",
          timeSpent: 2000,
        });

      const filesData = await extensionService.upsertFiles(mockedEntry);

      expect(filesData).toBeDefined();
      expect(filesData).toEqual({
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
          timeSpent: 1000,
          fileName: "Dockerfile",
          projectName: "factory",
          projectPath: "/home/user/projects/factory",
        },
      });

      expect(projectsService.update).toHaveBeenCalledOnce();
      expect(projectsService.update).toHaveBeenNthCalledWith(1, {
        dailyDataId: "2",
        name: "mooncode",
        path: "/home/user/projects/mooncode",
        timeSpent: 2600,
      });
    });

    it("should create the file for the day if it doesn't exist", async () => {
      const mockedEntry = {
        userId: "1",
        filesData: {
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
        },
        targetedDate: "2026-06-21",
      };

      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: 1900,
      });

      projectsService.findOne
        .mockResolvedValueOnce({
          id: "3",
          name: "mooncode",
          path: "/home/user/projects/mooncode",
          timeSpent: 800,
        })
        .mockResolvedValueOnce({
          id: "4",
          name: "factory",
          path: "/home/user/projects/factory",
          timeSpent: 1100,
        });

      projectsService.update
        .mockResolvedValueOnce({
          name: "mooncode",
          path: "/home/user/projects/mooncode",
          timeSpent: 2600,
          dailyDataId: "2",
        })
        .mockResolvedValueOnce({
          name: "factory",
          path: "/home/user/projects/factory",
          timeSpent: 1200,
          dailyDataId: "2",
        });

      filesService.findAllOnDay.mockResolvedValue({
        "/home/user/projects/mooncode/apps/api/tsconfig.json": {
          languageSlug: "json",
          timeSpent: 200,
          fileName: "tsconfig.json",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
        },
        "/home/user/projects/mooncode/apps/api/src/auth/auth.service.ts": {
          languageSlug: "typescript",
          timeSpent: 600,
          fileName: "auth.service.ts",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
        },
        "/home/user/projects/mooncode/Dockerfile": {
          languageSlug: "typescript",
          timeSpent: 1100,
          fileName: "Dockerfile",
          projectName: "factory",
          projectPath: "/home/user/projects/factory",
        },
      });

      languagesService.findOne
        .mockResolvedValueOnce({
          timeSpent: 200,
          languageSlug: "json",
          languageId: "5",
        })
        .mockResolvedValueOnce({
          timeSpent: 350,
          languageSlug: "typescript",
          languageId: "6",
        })
        .mockResolvedValue({
          timeSpent: 300,
          languageSlug: "docker",
          languageId: "7",
        });

      filesService.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      filesService.create
        .mockResolvedValueOnce({
          name: "package.json",
          path: "/home/user/projects/mooncode/apps/api/package.json",
          timeSpent: 600,
        })
        .mockResolvedValueOnce({
          name: "main.ts",
          path: "/home/user/projects/mooncode/apps/api/main.ts",
          timeSpent: 2000,
        })
        .mockResolvedValueOnce({
          name: "Dockerfile",
          path: "/home/user/projects/factory/Dockerfile",
          timeSpent: 1200,
        });

      const filesData = await extensionService.upsertFiles(mockedEntry);
      expect(filesData).toBeDefined();
      expect(filesData).toEqual({
        "/home/user/projects/mooncode/apps/api/tsconfig.json": {
          languageSlug: "json",
          timeSpent: 200,
          fileName: "tsconfig.json",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
        },
        "/home/user/projects/mooncode/apps/api/src/auth/auth.service.ts": {
          languageSlug: "typescript",
          timeSpent: 600,
          fileName: "auth.service.ts",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
        },
        "/home/user/projects/mooncode/Dockerfile": {
          languageSlug: "typescript",
          timeSpent: 1100,
          fileName: "Dockerfile",
          projectName: "factory",
          projectPath: "/home/user/projects/factory",
        },
        ...mockedEntry.filesData,
      });

      expect(filesService.create).toHaveBeenCalled();
      expect(filesService.create).toHaveBeenCalledTimes(3);
      expect(filesService.create).toHaveBeenNthCalledWith(1, {
        projectId: "3",
        languageId: "5",
        path: "/home/user/projects/mooncode/apps/api/package.json",
        timeSpent: 600,
        name: "package.json",
      });
      expect(filesService.create).toHaveBeenNthCalledWith(2, {
        projectId: "3",
        languageId: "6",
        path: "/home/user/projects/mooncode/apps/api/main.ts",
        timeSpent: 2000,
        name: "main.ts",
      });
      expect(filesService.create).toHaveBeenNthCalledWith(3, {
        projectId: "4",
        languageId: "7",
        path: "/home/user/projects/factory/Dockerfile",
        timeSpent: 1200,
        name: "Dockerfile",
      });
    });

    it("should update the file data for the day if it exists and the new time spent is greater than the existing one", async () => {
      const mockedEntry = {
        userId: "1",
        filesData: {
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
        },
        targetedDate: "2026-06-21",
      };

      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: 3000,
      });

      projectsService.findOne
        .mockResolvedValueOnce({
          id: "3",
          name: "mooncode",
          path: "/home/user/projects/mooncode",
          timeSpent: 2000,
        })
        .mockResolvedValueOnce({
          id: "4",
          name: "factory",
          path: "/home/user/projects/factory",
          timeSpent: 1000,
        });

      projectsService.update
        .mockResolvedValueOnce({
          name: "mooncode",
          path: "/home/user/projects/mooncode",
          timeSpent: 2600,
          dailyDataId: "2",
        })
        .mockResolvedValueOnce({
          name: "factory",
          path: "/home/user/projects/factory",
          timeSpent: 1200,
          dailyDataId: "2",
        });

      filesService.findAllOnDay.mockResolvedValue({
        "/home/user/projects/mooncode/apps/api/package.json": {
          languageSlug: "json",
          timeSpent: 200,
          fileName: "package.json",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
        },
        "/home/user/projects/mooncode/apps/api/main.ts": {
          languageSlug: "typescript",
          timeSpent: 1800,
          fileName: "main.ts",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
        },
        "/home/user/projects/factory/Dockerfile": {
          languageSlug: "docker",
          timeSpent: 1000,
          fileName: "Dockerfile",
          projectName: "factory",
          projectPath: "/home/user/projects/factory",
        },
      });

      languagesService.findOne
        .mockResolvedValueOnce({
          timeSpent: 200,
          languageSlug: "json",
          languageId: "5",
        })
        .mockResolvedValueOnce({
          timeSpent: 1800,
          languageSlug: "typescript",
          languageId: "6",
        })
        .mockResolvedValue({
          timeSpent: 1000,
          languageSlug: "docker",
          languageId: "7",
        });

      filesService.findOne
        .mockResolvedValueOnce({
          name: "package.json",
          path: "/home/user/projects/mooncode/apps/api/package.json",
          timeSpent: 200,
        })
        .mockResolvedValueOnce({
          name: "main.ts",
          path: "/home/user/projects/mooncode/apps/api/main.ts",
          timeSpent: 1800,
        })
        .mockResolvedValueOnce({
          name: "Dockerfile",
          path: "/home/user/projects/factory/Dockerfile",
          timeSpent: 1000,
        });

      filesService.update
        .mockResolvedValueOnce({
          name: "package.json",
          path: "/home/user/projects/mooncode/apps/api/package.json",
          timeSpent: 600,
        })
        .mockResolvedValueOnce({
          name: "main.ts",
          path: "/home/user/projects/mooncode/apps/api/main.ts",
          timeSpent: 2000,
        })
        .mockResolvedValueOnce({
          name: "Dockerfile",
          path: "/home/user/projects/factory/Dockerfile",
          timeSpent: 1200,
        });

      const filesData = await extensionService.upsertFiles(mockedEntry);

      expect(filesData).toBeDefined();
      expect(filesData).toEqual(mockedEntry.filesData);

      expect(filesService.update).toHaveBeenCalled();
      expect(filesService.update).toHaveBeenCalledTimes(3);
      expect(filesService.update).toHaveBeenNthCalledWith(1, {
        projectId: "3",
        languageId: "5",
        path: "/home/user/projects/mooncode/apps/api/package.json",
        timeSpent: 600,
        name: "package.json",
      });
      expect(filesService.update).toHaveBeenNthCalledWith(2, {
        projectId: "3",
        languageId: "6",
        path: "/home/user/projects/mooncode/apps/api/main.ts",
        timeSpent: 2000,
        name: "main.ts",
      });
      expect(filesService.update).toHaveBeenNthCalledWith(3, {
        projectId: "4",
        languageId: "7",
        path: "/home/user/projects/factory/Dockerfile",
        timeSpent: 1200,
        name: "Dockerfile",
      });
    });

    it("should NOT update the file data for the day if it exists and the new time spent is less than the existing one", async () => {
      const mockedEntry = {
        userId: "1",
        filesData: {
          "/home/user/projects/mooncode/apps/api/package.json": {
            languageSlug: "json",
            timeSpent: 400,
            fileName: "package.json",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
          },
          "/home/user/projects/mooncode/apps/api/main.ts": {
            languageSlug: "typescript",
            timeSpent: 1000,
            fileName: "main.ts",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
          },
          "/home/user/projects/factory/Dockerfile": {
            languageSlug: "docker",
            timeSpent: 800,
            fileName: "Dockerfile",
            projectName: "factory",
            projectPath: "/home/user/projects/factory",
          },
        },
        targetedDate: "2026-06-21",
      };

      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: 3300,
      });

      projectsService.findOne
        .mockResolvedValueOnce({
          id: "3",
          name: "mooncode",
          path: "/home/user/projects/mooncode",
          timeSpent: 2300,
        })
        .mockResolvedValueOnce({
          id: "4",
          name: "factory",
          path: "/home/user/projects/factory",
          timeSpent: 1000,
        });

      filesService.findAllOnDay.mockResolvedValue({
        "/home/user/projects/mooncode/apps/api/package.json": {
          languageSlug: "json",
          timeSpent: 500,
          fileName: "package.json",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
        },
        "/home/user/projects/mooncode/apps/api/main.ts": {
          languageSlug: "typescript",
          timeSpent: 1800,
          fileName: "main.ts",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
        },
        "/home/user/projects/factory/Dockerfile": {
          languageSlug: "docker",
          timeSpent: 1000,
          fileName: "Dockerfile",
          projectName: "factory",
          projectPath: "/home/user/projects/factory",
        },
      });

      languagesService.findOne
        .mockResolvedValueOnce({
          timeSpent: 500,
          languageSlug: "json",
          languageId: "5",
        })
        .mockResolvedValueOnce({
          timeSpent: 1800,
          languageSlug: "typescript",
          languageId: "6",
        })
        .mockResolvedValue({
          timeSpent: 1000,
          languageSlug: "docker",
          languageId: "7",
        });

      filesService.findOne
        .mockResolvedValueOnce({
          name: "package.json",
          path: "/home/user/projects/mooncode/apps/api/package.json",
          timeSpent: 500,
        })
        .mockResolvedValueOnce({
          name: "main.ts",
          path: "/home/user/projects/mooncode/apps/api/main.ts",
          timeSpent: 1800,
        })
        .mockResolvedValueOnce({
          name: "Dockerfile",
          path: "/home/user/projects/factory/Dockerfile",
          timeSpent: 1000,
        });

      const filesData = await extensionService.upsertFiles(mockedEntry);

      expect(filesData).toBeDefined();
      expect(filesData).toEqual({
        "/home/user/projects/mooncode/apps/api/package.json": {
          languageSlug: "json",
          timeSpent: 500,
          fileName: "package.json",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
        },
        "/home/user/projects/mooncode/apps/api/main.ts": {
          languageSlug: "typescript",
          timeSpent: 1800,
          fileName: "main.ts",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
        },
        "/home/user/projects/factory/Dockerfile": {
          languageSlug: "docker",
          timeSpent: 1000,
          fileName: "Dockerfile",
          projectName: "factory",
          projectPath: "/home/user/projects/factory",
        },
      });

      expect(filesService.update).not.toHaveBeenCalled();
    });

    it("should ONLY update files where the new time spent is greater than the existing one", async () => {
      const mockedEntry = {
        userId: "1",
        filesData: {
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
            timeSpent: 800,
            fileName: "Dockerfile",
            projectName: "factory",
            projectPath: "/home/user/projects/factory",
          },
        },
        targetedDate: "2026-06-21",
      };

      dailyDataService.findOne.mockResolvedValue({
        id: "2",
        timeSpent: 3300,
      });

      projectsService.findOne
        .mockResolvedValueOnce({
          id: "3",
          name: "mooncode",
          path: "/home/user/projects/mooncode",
          timeSpent: 2300,
        })
        .mockResolvedValueOnce({
          id: "4",
          name: "factory",
          path: "/home/user/projects/factory",
          timeSpent: 1000,
        });

      projectsService.update.mockResolvedValueOnce({
        name: "mooncode",
        path: "/home/user/projects/mooncode",
        timeSpent: 2600,
        dailyDataId: "2",
      });

      filesService.findAllOnDay.mockResolvedValue({
        "/home/user/projects/mooncode/apps/api/package.json": {
          languageSlug: "json",
          timeSpent: 500,
          fileName: "package.json",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
        },
        "/home/user/projects/mooncode/apps/api/main.ts": {
          languageSlug: "typescript",
          timeSpent: 1800,
          fileName: "main.ts",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
        },
        "/home/user/projects/factory/Dockerfile": {
          languageSlug: "docker",
          timeSpent: 1000,
          fileName: "Dockerfile",
          projectName: "factory",
          projectPath: "/home/user/projects/factory",
        },
      });

      languagesService.findOne
        .mockResolvedValueOnce({
          timeSpent: 500,
          languageSlug: "json",
          languageId: "5",
        })
        .mockResolvedValueOnce({
          timeSpent: 1800,
          languageSlug: "typescript",
          languageId: "6",
        })
        .mockResolvedValue({
          timeSpent: 1000,
          languageSlug: "docker",
          languageId: "7",
        });

      filesService.findOne
        .mockResolvedValueOnce({
          name: "package.json",
          path: "/home/user/projects/mooncode/apps/api/package.json",
          timeSpent: 500,
        })
        .mockResolvedValueOnce({
          name: "main.ts",
          path: "/home/user/projects/mooncode/apps/api/main.ts",
          timeSpent: 1800,
        })
        .mockResolvedValueOnce({
          name: "Dockerfile",
          path: "/home/user/projects/factory/Dockerfile",
          timeSpent: 1000,
        });

      filesService.update
        .mockResolvedValueOnce({
          name: "package.json",
          path: "/home/user/projects/mooncode/apps/api/package.json",
          timeSpent: 600,
        })
        .mockResolvedValueOnce({
          name: "main.ts",
          path: "/home/user/projects/mooncode/apps/api/main.ts",
          timeSpent: 2000,
        });

      const filesData = await extensionService.upsertFiles(mockedEntry);

      expect(filesData).toBeDefined();
      expect(filesData).toEqual({
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
          timeSpent: 1000,
          fileName: "Dockerfile",
          projectName: "factory",
          projectPath: "/home/user/projects/factory",
        },
      });

      expect(filesService.update).toHaveBeenCalledTimes(2);
      expect(filesService.update).toHaveBeenNthCalledWith(1, {
        projectId: "3",
        languageId: "5",
        path: "/home/user/projects/mooncode/apps/api/package.json",
        timeSpent: 600,
        name: "package.json",
      });
      expect(filesService.update).toHaveBeenNthCalledWith(2, {
        projectId: "3",
        languageId: "6",
        path: "/home/user/projects/mooncode/apps/api/main.ts",
        timeSpent: 2000,
        name: "main.ts",
      });
    });
  });
});
