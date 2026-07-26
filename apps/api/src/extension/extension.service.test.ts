import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import { BranchesService } from "@/branches/branches.service";
import { DailyDataService } from "@/daily-data/daily-data.service";
import { FilesService } from "@/files/files.service";
import { LanguagesService } from "@/languages/languages.service";
import { ProjectsService } from "@/projects/projects.service";
import { TelemetryService } from "@/telemetry/telemetry.service";
import { Test } from "@nestjs/testing";
import { Procedure } from "@vitest/spy";

import { ExtensionService } from "./extension.service";

describe("ExtensionService", () => {
  let extensionService: ExtensionService;

  let telemetryService: {
    findOne: Mock<Procedure>;
    create: Mock<Procedure>;
  };

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

  let branchesService: {
    create: Mock<Procedure>;
    findOne: Mock<Procedure>;
    update: Mock<Procedure>;
  };

  let filesService: {
    findAllOnDay: Mock<Procedure>;
    findOne: Mock<Procedure>;
    update: Mock<Procedure>;
    create: Mock<Procedure>;
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    telemetryService = {
      create: vi.fn(),
      findOne: vi.fn(),
    };

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

    branchesService = {
      create: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
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
        { provide: TelemetryService, useValue: telemetryService },
        { provide: DailyDataService, useValue: dailyDataService },
        { provide: LanguagesService, useValue: languagesService },
        { provide: ProjectsService, useValue: projectsService },
        { provide: BranchesService, useValue: branchesService },
        { provide: FilesService, useValue: filesService },
      ],
    }).compile();

    extensionService = moduleRef.get(ExtensionService);
  });

  describe("collectTelemetryData", () => {
    it("should return the matching telemetry event if it already exists", async () => {
      const mockedEntry = {
        userId: "1",
        machineId:
          "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
        extensionVersion: "0.0.71",
        vscodeVersion: "1.129.1",
      };

      const mockedExistingTelemetryEvent = {
        machineId:
          "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
        extensionVersion: "0.0.71",
        vscodeVersion: "1.129.1",
      };

      telemetryService.findOne.mockResolvedValue(mockedExistingTelemetryEvent);

      const telemetryEvent =
        await extensionService.collectTelemetryData(mockedEntry);

      expect(telemetryEvent).toBeDefined();
      expect(telemetryEvent).toEqual(mockedExistingTelemetryEvent);
    });

    it("should create the telemetry event if it doesn't already exists for that specific machine", async () => {
      const mockedEntry = {
        userId: "1",
        machineId:
          "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
        extensionVersion: "0.0.71",
        vscodeVersion: "1.129.1",
      };

      const mockedCreatedTelemetryEvent = {
        machineId:
          "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
        extensionVersion: "0.0.71",
        vscodeVersion: "1.129.1",
      };

      telemetryService.findOne.mockResolvedValue(null);
      telemetryService.create.mockResolvedValue(mockedCreatedTelemetryEvent);

      const telemetryEvent =
        await extensionService.collectTelemetryData(mockedEntry);

      expect(telemetryService.create).toHaveBeenCalled();
      expect(telemetryService.create).toHaveBeenCalledWith({ ...mockedEntry });

      expect(telemetryEvent).toBeDefined();
      expect(telemetryEvent).toEqual(mockedCreatedTelemetryEvent);
    });

    it("should create the telemetry event if it exists for that specific machine but the extension version has changed", async () => {
      const mockedEntry = {
        userId: "1",
        machineId:
          "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
        extensionVersion: "0.0.72",
        vscodeVersion: "1.129.1",
      };

      const mockedFoundTelemetryEvent = {
        machineId:
          "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
        extensionVersion: "0.0.71",
        vscodeVersion: "1.129.1",
      };

      const mockedCreatedTelemetryEvent = {
        machineId:
          "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
        extensionVersion: "0.0.72",
        vscodeVersion: "1.129.1",
      };

      telemetryService.findOne.mockResolvedValue(mockedFoundTelemetryEvent);
      telemetryService.create.mockResolvedValue(mockedCreatedTelemetryEvent);

      const telemetryEvent =
        await extensionService.collectTelemetryData(mockedEntry);

      expect(telemetryService.create).toHaveBeenCalled();
      expect(telemetryService.create).toHaveBeenCalledWith({ ...mockedEntry });

      expect(telemetryEvent).toBeDefined();
      expect(telemetryEvent).toEqual(mockedCreatedTelemetryEvent);
    });

    it("should create the telemetry event if it exists for that specific machine but the vscode version has changed", async () => {
      const mockedEntry = {
        userId: "1",
        machineId:
          "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
        extensionVersion: "0.0.72",
        vscodeVersion: "1.130.0",
      };

      const mockedFoundTelemetryEvent = {
        machineId:
          "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
        extensionVersion: "0.0.72",
        vscodeVersion: "1.129.1",
      };

      const mockedCreatedTelemetryEvent = {
        machineId:
          "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
        extensionVersion: "0.0.72",
        vscodeVersion: "1.130.0",
      };

      telemetryService.findOne.mockResolvedValue(mockedFoundTelemetryEvent);
      telemetryService.create.mockResolvedValue(mockedCreatedTelemetryEvent);

      const telemetryEvent =
        await extensionService.collectTelemetryData(mockedEntry);

      expect(telemetryEvent).toBeDefined();
      expect(telemetryService.create).toHaveBeenCalled();
      expect(telemetryService.create).toHaveBeenCalledWith({ ...mockedEntry });
      expect(telemetryEvent).toEqual(mockedCreatedTelemetryEvent);
    });
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
    it.for([
      {
        mockedEntry: {
          userId: "1",
          dateString: "2026-06-20",
          type: "old" as const,
        },
        mockedOutput: {
          "/home/user/projects/mooncode/apps/api/package.json": {
            languageSlug: "json",
            timeSpent: 600,
            fileName: "package.json",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "main",
          },
          "/home/user/projects/mooncode/apps/api/main.ts": {
            languageSlug: "typescript",
            timeSpent: 2000,
            fileName: "main.ts",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "main",
          },
          "/home/user/projects/factory/Dockerfile": {
            languageSlug: "docker",
            timeSpent: 1200,
            fileName: "Dockerfile",
            projectName: "factory",
            projectPath: "/home/user/projects/factory",
            branchName: "test",
          },
        },
      },
      {
        mockedEntry: {
          userId: "1",
          dateString: "2026-06-20",
          type: "new" as const,
        },
        mockedOutput: {
          "/home/user/projects/factory": {
            test: {
              "/home/user/projects/factory/Dockerfile": {
                fileName: "Dockerfile",
                languageSlug: "docker",
                projectName: "factory",
                timeSpent: 1200,
              },
            },
          },
          "/home/user/projects/mooncode": {
            main: {
              "/home/user/projects/mooncode/apps/api/main.ts": {
                fileName: "main.ts",
                languageSlug: "typescript",
                projectName: "mooncode",
                timeSpent: 2000,
              },
              "/home/user/projects/mooncode/apps/api/package.json": {
                fileName: "package.json",
                languageSlug: "json",
                projectName: "mooncode",
                timeSpent: 600,
              },
            },
          },
        },
      },
    ])(
      "should return an object containing the data about each file on the provided day",
      async ({ mockedEntry, mockedOutput }) => {
        const mockedTimeSpent = 3800;
        const mockedFilesOnDay = [
          {
            languageSlug: "json",
            timeSpent: 600,
            fileName: "package.json",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            filePath: "/home/user/projects/mooncode/apps/api/package.json",
            branchName: "main",
          },
          {
            languageSlug: "typescript",
            timeSpent: 2000,
            fileName: "main.ts",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            filePath: "/home/user/projects/mooncode/apps/api/main.ts",
            branchName: "main",
          },
          {
            languageSlug: "docker",
            timeSpent: 1200,
            fileName: "Dockerfile",
            projectName: "factory",
            projectPath: "/home/user/projects/factory",
            filePath: "/home/user/projects/factory/Dockerfile",
            branchName: "test",
          },
        ];

        dailyDataService.findOne.mockResolvedValue({
          id: "2",
          timeSpent: mockedTimeSpent,
        });

        filesService.findAllOnDay.mockResolvedValue(mockedFilesOnDay);

        const filesData = await extensionService.getFilesForDay(mockedEntry);

        expect(filesData).toBeDefined();
        expect(filesData).toEqual(mockedOutput);
      },
    );

    it.for([
      {
        mockedEntry: {
          userId: "1",
          dateString: "2026-06-20",
          type: "old" as const,
        },
      },
      {
        mockedEntry: {
          userId: "1",
          dateString: "2026-06-20",
          type: "new" as const,
        },
      },
    ])(
      "should return an empty state if there is no files data on the provided day",
      async ({ mockedEntry }) => {
        dailyDataService.findOne.mockResolvedValue(null);

        const filesData = await extensionService.getFilesForDay(mockedEntry);

        expect(filesData).toBeDefined();
        expect(filesData).toEqual({});
      },
    );
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
    it.for([
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode/apps/api/package.json": {
              languageSlug: "json",
              timeSpent: 600,
              fileName: "package.json",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "main",
            },
            "/home/user/projects/mooncode/apps/api/main.ts": {
              languageSlug: "typescript",
              timeSpent: 2000,
              fileName: "main.ts",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "test",
            },
            "/home/user/projects/factory/Dockerfile": {
              languageSlug: "docker",
              timeSpent: 1200,
              fileName: "Dockerfile",
              projectName: "factory",
              projectPath: "/home/user/projects/factory",
              branchName: "main",
            },
          },
          targetedDate: "2026-06-21",
          type: "old" as const,
        },
      },
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode": {
              main: {
                "/home/user/projects/mooncode/apps/api/package.json": {
                  languageSlug: "json",
                  timeSpent: 600,
                  fileName: "package.json",
                  projectName: "mooncode",
                },
              },
              test: {
                "/home/user/projects/mooncode/apps/api/main.ts": {
                  languageSlug: "typescript",
                  timeSpent: 2000,
                  fileName: "main.ts",
                  projectName: "mooncode",
                },
              },
            },
            "/home/user/projects/factory": {
              main: {
                "/home/user/projects/factory/Dockerfile": {
                  languageSlug: "docker",
                  timeSpent: 1200,
                  fileName: "Dockerfile",
                  projectName: "factory",
                },
              },
            },
          } as Record<
            string,
            Record<
              string,
              Record<
                string,
                {
                  timeSpent: number;
                  languageSlug: string;
                  projectName: string;
                  fileName: string;
                }
              >
            >
          >,
          targetedDate: "2026-06-21",
          type: "new" as const,
        },
      },
    ])("should return the updated files", async ({ mockedEntry }) => {
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

      branchesService.findOne
        .mockResolvedValueOnce({
          id: "5",
          name: "main",
          timeSpent: 200,
        })
        .mockResolvedValueOnce({
          id: "6",
          name: "test",
          timeSpent: 1800,
        })
        .mockResolvedValueOnce({
          id: "7",
          name: "main",
          timeSpent: 1000,
        });

      branchesService.update
        .mockResolvedValueOnce({
          projectId: "3",
          name: "main",
          timeSpent: 600,
        })
        .mockResolvedValueOnce({
          projectId: "3",
          name: "test",
          timeSpent: 2000,
        })
        .mockResolvedValueOnce({
          projectId: "4",
          name: "main",
          timeSpent: 1200,
        });

      filesService.findAllOnDay.mockResolvedValue([
        {
          languageSlug: "json",
          timeSpent: 200,
          fileName: "package.json",
          filePath: "/home/user/projects/mooncode/apps/api/package.json",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
          branchName: "main",
        },
        {
          languageSlug: "typescript",
          timeSpent: 1800,
          fileName: "main.ts",
          filePath: "/home/user/projects/mooncode/apps/api/main.ts",
          projectName: "mooncode",
          projectPath: "/home/user/projects/mooncode",
          branchName: "test",
        },
        {
          languageSlug: "docker",
          timeSpent: 1000,
          fileName: "Dockerfile",
          filePath: "/home/user/projects/factory/Dockerfile",
          projectName: "factory",
          projectPath: "/home/user/projects/factory",
          branchName: "main",
        },
      ]);

      languagesService.findOne
        .mockResolvedValueOnce({
          timeSpent: 200,
          languageSlug: "json",
          languageId: "11",
        })
        .mockResolvedValueOnce({
          timeSpent: 1800,
          languageSlug: "typescript",
          languageId: "12",
        })
        .mockResolvedValue({
          timeSpent: 1000,
          languageSlug: "docker",
          languageId: "13",
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

    it.for([
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode/apps/api/package.json": {
              languageSlug: "json",
              timeSpent: 600,
              fileName: "package.json",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "main",
            },
            "/home/user/projects/mooncode/apps/api/main.ts": {
              languageSlug: "typescript",
              timeSpent: 2000,
              fileName: "main.ts",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "test",
            },
            "/home/user/projects/factory/Dockerfile": {
              languageSlug: "docker",
              timeSpent: 1200,
              fileName: "Dockerfile",
              projectName: "factory",
              projectPath: "/home/user/projects/factory",
              branchName: "main",
            },
          },
          targetedDate: "2026-06-21",
          type: "old" as const,
        },
      },
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode": {
              main: {
                "/home/user/projects/mooncode/apps/api/package.json": {
                  languageSlug: "json",
                  timeSpent: 600,
                  fileName: "package.json",
                  projectName: "mooncode",
                },
              },
              test: {
                "/home/user/projects/mooncode/apps/api/main.ts": {
                  languageSlug: "typescript",
                  timeSpent: 2000,
                  fileName: "main.ts",
                  projectName: "mooncode",
                },
              },
            },
            "/home/user/projects/factory": {
              main: {
                "/home/user/projects/factory/Dockerfile": {
                  languageSlug: "docker",
                  timeSpent: 1200,
                  fileName: "Dockerfile",
                  projectName: "factory",
                },
              },
            },
          } as Record<
            string,
            Record<
              string,
              Record<
                string,
                {
                  timeSpent: number;
                  languageSlug: string;
                  projectName: string;
                  fileName: string;
                }
              >
            >
          >,
          targetedDate: "2026-06-21",
          type: "new" as const,
        },
      },
    ])(
      "should return an empty object if the data for the day doesn't exists (impossible state)",
      async ({ mockedEntry }) => {
        dailyDataService.findOne.mockResolvedValue(null);

        const filesData = await extensionService.upsertFiles(mockedEntry);

        expect(filesData).toBeDefined();
        expect(filesData).toEqual({});
      },
    );

    it.for([
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode/apps/api/package.json": {
              languageSlug: "json",
              timeSpent: 600,
              fileName: "package.json",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "main",
            },
            "/home/user/projects/mooncode/apps/api/main.ts": {
              languageSlug: "typescript",
              timeSpent: 2000,
              fileName: "main.ts",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "test",
            },
            "/home/user/projects/factory/Dockerfile": {
              languageSlug: "docker",
              timeSpent: 1200,
              fileName: "Dockerfile",
              projectName: "factory",
              projectPath: "/home/user/projects/factory",
              branchName: "main",
            },
          },
          targetedDate: "2026-06-21",
          type: "old" as const,
        },
      },
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode": {
              main: {
                "/home/user/projects/mooncode/apps/api/package.json": {
                  languageSlug: "json",
                  timeSpent: 600,
                  fileName: "package.json",
                  projectName: "mooncode",
                },
              },
              test: {
                "/home/user/projects/mooncode/apps/api/main.ts": {
                  languageSlug: "typescript",
                  timeSpent: 2000,
                  fileName: "main.ts",
                  projectName: "mooncode",
                },
              },
            },
            "/home/user/projects/factory": {
              main: {
                "/home/user/projects/factory/Dockerfile": {
                  languageSlug: "docker",
                  timeSpent: 1200,
                  fileName: "Dockerfile",
                  projectName: "factory",
                },
              },
            },
          } as Record<
            string,
            Record<
              string,
              Record<
                string,
                {
                  timeSpent: number;
                  languageSlug: string;
                  projectName: string;
                  fileName: string;
                }
              >
            >
          >,
          targetedDate: "2026-06-21",
          type: "new" as const,
        },
      },
    ])(
      "should create the project for the day if it doesn't exist",
      async ({ mockedEntry }) => {
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
            dailyDataId: "3",
          })
          .mockResolvedValueOnce({
            name: "factory",
            path: "/home/user/projects/factory",
            timeSpent: 1200,
            dailyDataId: "4",
          });

        branchesService.findOne
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(null);

        branchesService.create
          .mockResolvedValueOnce({
            id: "5",
            name: "main",
            timeSpent: 600,
          })
          .mockResolvedValueOnce({
            id: "6",
            name: "test",
            timeSpent: 2000,
          })
          .mockResolvedValueOnce({
            id: "7",
            name: "main",
            timeSpent: 1200,
          });

        filesService.findAllOnDay.mockResolvedValue([]);

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
      },
    );

    it.for([
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode/apps/api/package.json": {
              languageSlug: "json",
              timeSpent: 600,
              fileName: "package.json",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "main",
            },
            "/home/user/projects/mooncode/apps/api/main.ts": {
              languageSlug: "typescript",
              timeSpent: 2000,
              fileName: "main.ts",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "test",
            },
            "/home/user/projects/factory/Dockerfile": {
              languageSlug: "docker",
              timeSpent: 1200,
              fileName: "Dockerfile",
              projectName: "factory",
              projectPath: "/home/user/projects/factory",
              branchName: "main",
            },
          },
          targetedDate: "2026-06-21",
          type: "old" as const,
        },
      },
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode": {
              main: {
                "/home/user/projects/mooncode/apps/api/package.json": {
                  languageSlug: "json",
                  timeSpent: 600,
                  fileName: "package.json",
                  projectName: "mooncode",
                },
              },
              test: {
                "/home/user/projects/mooncode/apps/api/main.ts": {
                  languageSlug: "typescript",
                  timeSpent: 2000,
                  fileName: "main.ts",
                  projectName: "mooncode",
                },
              },
            },
            "/home/user/projects/factory": {
              main: {
                "/home/user/projects/factory/Dockerfile": {
                  languageSlug: "docker",
                  timeSpent: 1200,
                  fileName: "Dockerfile",
                  projectName: "factory",
                },
              },
            },
          } as Record<
            string,
            Record<
              string,
              Record<
                string,
                {
                  timeSpent: number;
                  languageSlug: string;
                  projectName: string;
                  fileName: string;
                }
              >
            >
          >,
          targetedDate: "2026-06-21",
          type: "new" as const,
        },
      },
    ])(
      "should update the project data for the day if it exists and the new time spent is greater than the existing one",
      async ({ mockedEntry }) => {
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

        branchesService.findOne
          .mockResolvedValueOnce({
            id: "5",
            name: "main",
            timeSpent: 200,
          })
          .mockResolvedValueOnce({
            id: "6",
            name: "test",
            timeSpent: 1800,
          })
          .mockResolvedValueOnce({
            id: "7",
            name: "main",
            timeSpent: 1000,
          });

        branchesService.update
          .mockResolvedValueOnce({
            projectId: "3",
            name: "main",
            timeSpent: 600,
          })
          .mockResolvedValueOnce({
            projectId: "3",
            name: "test",
            timeSpent: 2000,
          })
          .mockResolvedValueOnce({
            projectId: "4",
            name: "main",
            timeSpent: 1200,
          });

        filesService.findAllOnDay.mockResolvedValue([
          {
            languageSlug: "json",
            timeSpent: 200,
            fileName: "package.json",
            filePath: "/home/user/projects/mooncode/apps/api/package.json",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "main",
          },
          {
            languageSlug: "typescript",
            timeSpent: 1800,
            fileName: "main.ts",
            filePath: "/home/user/projects/mooncode/apps/api/main.ts",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "test",
          },
          {
            languageSlug: "docker",
            timeSpent: 1000,
            fileName: "Dockerfile",
            filePath: "/home/user/projects/factory/Dockerfile",
            projectName: "factory",
            projectPath: "/home/user/projects/factory",
            branchName: "main",
          },
        ]);

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
      },
    );

    it.for([
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode/apps/api/package.json": {
              languageSlug: "json",
              timeSpent: 400,
              fileName: "package.json",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "main",
            },
            "/home/user/projects/mooncode/apps/api/main.ts": {
              languageSlug: "typescript",
              timeSpent: 1000,
              fileName: "main.ts",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "test",
            },
            "/home/user/projects/factory/Dockerfile": {
              languageSlug: "docker",
              timeSpent: 800,
              fileName: "Dockerfile",
              projectName: "factory",
              projectPath: "/home/user/projects/factory",
              branchName: "main",
            },
          },
          targetedDate: "2026-06-21",
          type: "old" as const,
        },
        mockedOutput: {
          "/home/user/projects/mooncode/apps/api/package.json": {
            languageSlug: "json",
            timeSpent: 500,
            fileName: "package.json",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "main",
          },
          "/home/user/projects/mooncode/apps/api/main.ts": {
            languageSlug: "typescript",
            timeSpent: 1800,
            fileName: "main.ts",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "test",
          },
          "/home/user/projects/factory/Dockerfile": {
            languageSlug: "docker",
            timeSpent: 1000,
            fileName: "Dockerfile",
            projectName: "factory",
            projectPath: "/home/user/projects/factory",
            branchName: "main",
          },
        },
      },
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode": {
              main: {
                "/home/user/projects/mooncode/apps/api/package.json": {
                  languageSlug: "json",
                  timeSpent: 400,
                  fileName: "package.json",
                  projectName: "mooncode",
                },
              },
              test: {
                "/home/user/projects/mooncode/apps/api/main.ts": {
                  languageSlug: "typescript",
                  timeSpent: 1000,
                  fileName: "main.ts",
                  projectName: "mooncode",
                },
              },
            },
            "/home/user/projects/factory": {
              main: {
                "/home/user/projects/factory/Dockerfile": {
                  languageSlug: "docker",
                  timeSpent: 800,
                  fileName: "Dockerfile",
                  projectName: "factory",
                },
              },
            },
          } as Record<
            string,
            Record<
              string,
              Record<
                string,
                {
                  timeSpent: number;
                  languageSlug: string;
                  projectName: string;
                  fileName: string;
                }
              >
            >
          >,
          targetedDate: "2026-06-21",
          type: "new" as const,
        },
        mockedOutput: {
          "/home/user/projects/mooncode": {
            main: {
              "/home/user/projects/mooncode/apps/api/package.json": {
                languageSlug: "json",
                timeSpent: 500,
                fileName: "package.json",
                projectName: "mooncode",
              },
            },
            test: {
              "/home/user/projects/mooncode/apps/api/main.ts": {
                languageSlug: "typescript",
                timeSpent: 1800,
                fileName: "main.ts",
                projectName: "mooncode",
              },
            },
          },
          "/home/user/projects/factory": {
            main: {
              "/home/user/projects/factory/Dockerfile": {
                languageSlug: "docker",
                timeSpent: 1000,
                fileName: "Dockerfile",
                projectName: "factory",
              },
            },
          },
        },
      },
    ])(
      "should NOT update the project data for the day if it exists and the new time spent is less than the existing one",
      async ({ mockedEntry, mockedOutput }) => {
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

        branchesService.findOne
          .mockResolvedValueOnce({
            id: "3",
            name: "main",
            timeSpent: 500,
          })
          .mockResolvedValueOnce({
            id: "4",
            name: "test",
            timeSpent: 1800,
          })
          .mockResolvedValueOnce({
            id: "5",
            name: "main",
            timeSpent: 1000,
          });

        filesService.findAllOnDay.mockResolvedValue([
          {
            languageSlug: "json",
            timeSpent: 500,
            fileName: "package.json",
            filePath: "/home/user/projects/mooncode/apps/api/package.json",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "main",
          },
          {
            languageSlug: "typescript",
            timeSpent: 1800,
            fileName: "main.ts",
            filePath: "/home/user/projects/mooncode/apps/api/main.ts",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "test",
          },
          {
            languageSlug: "docker",
            timeSpent: 1000,
            fileName: "Dockerfile",
            filePath: "/home/user/projects/factory/Dockerfile",
            projectName: "factory",
            projectPath: "/home/user/projects/factory",
            branchName: "main",
          },
        ]);

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
        expect(filesData).toEqual(mockedOutput);

        expect(projectsService.update).not.toHaveBeenCalled();
      },
    );

    it.for([
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode/apps/api/package.json": {
              languageSlug: "json",
              timeSpent: 600,
              fileName: "package.json",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "main",
            },
            "/home/user/projects/mooncode/apps/api/main.ts": {
              languageSlug: "typescript",
              timeSpent: 2000,
              fileName: "main.ts",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "test",
            },
            "/home/user/projects/factory/Dockerfile": {
              languageSlug: "docker",
              timeSpent: 800,
              fileName: "Dockerfile",
              projectName: "factory",
              projectPath: "/home/user/projects/factory",
              branchName: "main",
            },
          },
          targetedDate: "2026-06-21",
          type: "old" as const,
        },
        mockedOutput: {
          "/home/user/projects/mooncode/apps/api/package.json": {
            languageSlug: "json",
            timeSpent: 600,
            fileName: "package.json",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "main",
          },
          "/home/user/projects/mooncode/apps/api/main.ts": {
            languageSlug: "typescript",
            timeSpent: 2000,
            fileName: "main.ts",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "test",
          },
          "/home/user/projects/factory/Dockerfile": {
            languageSlug: "docker",
            timeSpent: 1000,
            fileName: "Dockerfile",
            projectName: "factory",
            projectPath: "/home/user/projects/factory",
            branchName: "main",
          },
        },
      },
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode": {
              main: {
                "/home/user/projects/mooncode/apps/api/package.json": {
                  languageSlug: "json",
                  timeSpent: 600,
                  fileName: "package.json",
                  projectName: "mooncode",
                },
              },
              test: {
                "/home/user/projects/mooncode/apps/api/main.ts": {
                  languageSlug: "typescript",
                  timeSpent: 2000,
                  fileName: "main.ts",
                  projectName: "mooncode",
                },
              },
            },
            "/home/user/projects/factory": {
              main: {
                "/home/user/projects/factory/Dockerfile": {
                  languageSlug: "docker",
                  timeSpent: 800,
                  fileName: "Dockerfile",
                  projectName: "factory",
                },
              },
            },
          } as Record<
            string,
            Record<
              string,
              Record<
                string,
                {
                  timeSpent: number;
                  languageSlug: string;
                  projectName: string;
                  fileName: string;
                }
              >
            >
          >,
          targetedDate: "2026-06-21",
          type: "new" as const,
        },
        mockedOutput: {
          "/home/user/projects/mooncode": {
            main: {
              "/home/user/projects/mooncode/apps/api/package.json": {
                languageSlug: "json",
                timeSpent: 600,
                fileName: "package.json",
                projectName: "mooncode",
              },
            },
            test: {
              "/home/user/projects/mooncode/apps/api/main.ts": {
                languageSlug: "typescript",
                timeSpent: 2000,
                fileName: "main.ts",
                projectName: "mooncode",
              },
            },
          },
          "/home/user/projects/factory": {
            main: {
              "/home/user/projects/factory/Dockerfile": {
                languageSlug: "docker",
                timeSpent: 1000,
                fileName: "Dockerfile",
                projectName: "factory",
              },
            },
          },
        },
      },
    ])(
      "should ONLY update projects where the new time spent is greater than the existing one",
      async ({ mockedEntry, mockedOutput }) => {
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

        branchesService.findOne
          .mockResolvedValueOnce({
            id: "5",
            name: "main",
            timeSpent: 500,
          })
          .mockResolvedValueOnce({
            id: "6",
            name: "test",
            timeSpent: 1800,
          })
          .mockResolvedValueOnce({
            id: "7",
            name: "main",
            timeSpent: 1000,
          });

        branchesService.update
          .mockResolvedValueOnce({
            projectId: "3",
            name: "main",
            timeSpent: 600,
          })
          .mockResolvedValueOnce({
            projectId: "3",
            name: "test",
            timeSpent: 2000,
          });

        filesService.findAllOnDay.mockResolvedValue([
          {
            languageSlug: "json",
            timeSpent: 500,
            fileName: "package.json",
            filePath: "/home/user/projects/mooncode/apps/api/package.json",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "main",
          },
          {
            languageSlug: "typescript",
            timeSpent: 1800,
            fileName: "main.ts",
            filePath: "/home/user/projects/mooncode/apps/api/main.ts",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "test",
          },
          {
            languageSlug: "docker",
            timeSpent: 1000,
            fileName: "Dockerfile",
            filePath: "/home/user/projects/factory/Dockerfile",
            projectName: "factory",
            projectPath: "/home/user/projects/factory",
            branchName: "main",
          },
        ]);

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
        expect(filesData).toEqual(mockedOutput);

        expect(projectsService.update).toHaveBeenCalledOnce();
        expect(projectsService.update).toHaveBeenNthCalledWith(1, {
          dailyDataId: "2",
          name: "mooncode",
          path: "/home/user/projects/mooncode",
          timeSpent: 2600,
        });
      },
    );

    it.for([
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode/apps/api/package.json": {
              languageSlug: "json",
              timeSpent: 600,
              fileName: "package.json",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "main",
            },
            "/home/user/projects/mooncode/apps/api/main.ts": {
              languageSlug: "typescript",
              timeSpent: 2000,
              fileName: "main.ts",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "test",
            },
            "/home/user/projects/factory/Dockerfile": {
              languageSlug: "docker",
              timeSpent: 1200,
              fileName: "Dockerfile",
              projectName: "factory",
              projectPath: "/home/user/projects/factory",
              branchName: "main",
            },
          },
          targetedDate: "2026-06-21",
          type: "old" as const,
        },
      },
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode": {
              main: {
                "/home/user/projects/mooncode/apps/api/package.json": {
                  languageSlug: "json",
                  timeSpent: 600,
                  fileName: "package.json",
                  projectName: "mooncode",
                },
              },
              test: {
                "/home/user/projects/mooncode/apps/api/main.ts": {
                  languageSlug: "typescript",
                  timeSpent: 2000,
                  fileName: "main.ts",
                  projectName: "mooncode",
                },
              },
            },
            "/home/user/projects/factory": {
              main: {
                "/home/user/projects/factory/Dockerfile": {
                  languageSlug: "docker",
                  timeSpent: 1200,
                  fileName: "Dockerfile",
                  projectName: "factory",
                },
              },
            },
          } as Record<
            string,
            Record<
              string,
              Record<
                string,
                {
                  timeSpent: number;
                  languageSlug: string;
                  projectName: string;
                  fileName: string;
                }
              >
            >
          >,
          targetedDate: "2026-06-21",
          type: "new" as const,
        },
      },
    ])(
      "should create the branch for the project on the day if it doesn't exists",
      async ({ mockedEntry }) => {
        dailyDataService.findOne.mockResolvedValue({
          id: "2",
          timeSpent: 3000,
        });

        projectsService.findOne
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(null);

        projectsService.create
          .mockResolvedValueOnce({
            id: "3",
            name: "mooncode",
            timeSpent: 2600,
          })
          .mockResolvedValueOnce({
            id: "4",
            name: "factory",
            timeSpent: 1200,
          });

        branchesService.findOne
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(null);

        branchesService.create
          .mockResolvedValueOnce({
            id: "5",
            name: "main",
            timeSpent: 600,
          })
          .mockResolvedValueOnce({
            id: "6",
            name: "test",
            timeSpent: 2000,
          })
          .mockResolvedValueOnce({
            id: "7",
            name: "main",
            timeSpent: 1200,
          });

        filesService.findAllOnDay.mockResolvedValue([]);

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

        expect(branchesService.create).toHaveBeenCalled();
        expect(branchesService.create).toHaveBeenNthCalledWith(1, {
          projectId: "3",
          name: "main",
          timeSpent: 600,
        });
        expect(branchesService.create).toHaveBeenNthCalledWith(2, {
          projectId: "3",
          name: "test",
          timeSpent: 2000,
        });
        expect(branchesService.create).toHaveBeenNthCalledWith(3, {
          projectId: "4",
          name: "main",
          timeSpent: 1200,
        });
      },
    );

    it.for([
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode/apps/api/package.json": {
              languageSlug: "json",
              timeSpent: 600,
              fileName: "package.json",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "main",
            },
            "/home/user/projects/mooncode/apps/api/main.ts": {
              languageSlug: "typescript",
              timeSpent: 2000,
              fileName: "main.ts",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "test",
            },
            "/home/user/projects/factory/Dockerfile": {
              languageSlug: "docker",
              timeSpent: 1200,
              fileName: "Dockerfile",
              projectName: "factory",
              projectPath: "/home/user/projects/factory",
              branchName: "main",
            },
          },
          targetedDate: "2026-06-21",
          type: "old" as const,
        },
      },
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode": {
              main: {
                "/home/user/projects/mooncode/apps/api/package.json": {
                  languageSlug: "json",
                  timeSpent: 600,
                  fileName: "package.json",
                  projectName: "mooncode",
                },
              },
              test: {
                "/home/user/projects/mooncode/apps/api/main.ts": {
                  languageSlug: "typescript",
                  timeSpent: 2000,
                  fileName: "main.ts",
                  projectName: "mooncode",
                },
              },
            },
            "/home/user/projects/factory": {
              main: {
                "/home/user/projects/factory/Dockerfile": {
                  languageSlug: "docker",
                  timeSpent: 1200,
                  fileName: "Dockerfile",
                  projectName: "factory",
                },
              },
            },
          } as Record<
            string,
            Record<
              string,
              Record<
                string,
                {
                  timeSpent: number;
                  languageSlug: string;
                  projectName: string;
                  fileName: string;
                }
              >
            >
          >,
          targetedDate: "2026-06-21",
          type: "new" as const,
        },
      },
    ])(
      "should update the branch data for the project on the day if it exists and the new time spent is greater than the existing one",
      async ({ mockedEntry }) => {
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

        branchesService.findOne
          .mockResolvedValueOnce({
            id: "5",
            name: "main",
            timeSpent: 200,
          })
          .mockResolvedValueOnce({
            id: "6",
            name: "test",
            timeSpent: 1800,
          })
          .mockResolvedValueOnce({
            id: "7",
            name: "main",
            timeSpent: 1000,
          });

        branchesService.update
          .mockResolvedValueOnce({
            projectId: "3",
            name: "main",
            timeSpent: 600,
          })
          .mockResolvedValueOnce({
            projectId: "3",
            name: "test",
            timeSpent: 2000,
          })
          .mockResolvedValueOnce({
            projectId: "4",
            name: "main",
            timeSpent: 1200,
          });

        filesService.findAllOnDay.mockResolvedValue([
          {
            languageSlug: "json",
            timeSpent: 200,
            fileName: "package.json",
            filePath: "/home/user/projects/mooncode/apps/api/package.json",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "main",
          },
          {
            languageSlug: "typescript",
            timeSpent: 1800,
            fileName: "main.ts",
            filePath: "/home/user/projects/mooncode/apps/api/main.ts",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "test",
          },
          {
            languageSlug: "docker",
            timeSpent: 1000,
            fileName: "Dockerfile",
            filePath: "/home/user/projects/factory/Dockerfile",
            projectName: "factory",
            projectPath: "/home/user/projects/factory",
            branchName: "main",
          },
        ]);

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

        expect(branchesService.update).toHaveBeenCalled();
        expect(branchesService.update).toHaveBeenNthCalledWith(1, {
          projectId: "3",
          name: "main",
          timeSpent: 600,
        });
        expect(branchesService.update).toHaveBeenNthCalledWith(2, {
          projectId: "3",
          name: "test",
          timeSpent: 2000,
        });
        expect(branchesService.update).toHaveBeenNthCalledWith(3, {
          projectId: "4",
          name: "main",
          timeSpent: 1200,
        });
      },
    );

    it.for([
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode/apps/api/package.json": {
              languageSlug: "json",
              timeSpent: 400,
              fileName: "package.json",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "main",
            },
            "/home/user/projects/mooncode/apps/api/main.ts": {
              languageSlug: "typescript",
              timeSpent: 1000,
              fileName: "main.ts",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "test",
            },
            "/home/user/projects/factory/Dockerfile": {
              languageSlug: "docker",
              timeSpent: 800,
              fileName: "Dockerfile",
              projectName: "factory",
              projectPath: "/home/user/projects/factory",
              branchName: "main",
            },
          },
          targetedDate: "2026-06-21",
          type: "old" as const,
        },
        mockedOutput: {
          "/home/user/projects/mooncode/apps/api/package.json": {
            languageSlug: "json",
            timeSpent: 500,
            fileName: "package.json",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "main",
          },
          "/home/user/projects/mooncode/apps/api/main.ts": {
            languageSlug: "typescript",
            timeSpent: 1800,
            fileName: "main.ts",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "test",
          },
          "/home/user/projects/factory/Dockerfile": {
            languageSlug: "docker",
            timeSpent: 1000,
            fileName: "Dockerfile",
            projectName: "factory",
            projectPath: "/home/user/projects/factory",
            branchName: "main",
          },
        },
      },
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode": {
              main: {
                "/home/user/projects/mooncode/apps/api/package.json": {
                  languageSlug: "json",
                  timeSpent: 400,
                  fileName: "package.json",
                  projectName: "mooncode",
                },
              },
              test: {
                "/home/user/projects/mooncode/apps/api/main.ts": {
                  languageSlug: "typescript",
                  timeSpent: 1000,
                  fileName: "main.ts",
                  projectName: "mooncode",
                },
              },
            },
            "/home/user/projects/factory": {
              main: {
                "/home/user/projects/factory/Dockerfile": {
                  languageSlug: "docker",
                  timeSpent: 800,
                  fileName: "Dockerfile",
                  projectName: "factory",
                },
              },
            },
          } as Record<
            string,
            Record<
              string,
              Record<
                string,
                {
                  timeSpent: number;
                  languageSlug: string;
                  projectName: string;
                  fileName: string;
                }
              >
            >
          >,
          targetedDate: "2026-06-21",
          type: "new" as const,
        },
        mockedOutput: {
          "/home/user/projects/mooncode": {
            main: {
              "/home/user/projects/mooncode/apps/api/package.json": {
                languageSlug: "json",
                timeSpent: 500,
                fileName: "package.json",
                projectName: "mooncode",
              },
            },
            test: {
              "/home/user/projects/mooncode/apps/api/main.ts": {
                languageSlug: "typescript",
                timeSpent: 1800,
                fileName: "main.ts",
                projectName: "mooncode",
              },
            },
          },
          "/home/user/projects/factory": {
            main: {
              "/home/user/projects/factory/Dockerfile": {
                languageSlug: "docker",
                timeSpent: 1000,
                fileName: "Dockerfile",
                projectName: "factory",
              },
            },
          },
        },
      },
    ])(
      "should NOT update the branch data for the project on the day if it exists and the new time spent is less than the existing one",
      async ({ mockedEntry, mockedOutput }) => {
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

        branchesService.findOne
          .mockResolvedValueOnce({
            id: "3",
            name: "main",
            timeSpent: 500,
          })
          .mockResolvedValueOnce({
            id: "4",
            name: "test",
            timeSpent: 1800,
          })
          .mockResolvedValueOnce({
            id: "5",
            name: "main",
            timeSpent: 1000,
          });

        filesService.findAllOnDay.mockResolvedValue([
          {
            languageSlug: "json",
            timeSpent: 500,
            fileName: "package.json",
            filePath: "/home/user/projects/mooncode/apps/api/package.json",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "main",
          },
          {
            languageSlug: "typescript",
            timeSpent: 1800,
            fileName: "main.ts",
            filePath: "/home/user/projects/mooncode/apps/api/main.ts",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "test",
          },
          {
            languageSlug: "docker",
            timeSpent: 1000,
            fileName: "Dockerfile",
            filePath: "/home/user/projects/factory/Dockerfile",
            projectName: "factory",
            projectPath: "/home/user/projects/factory",
            branchName: "main",
          },
        ]);

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
        expect(filesData).toEqual(mockedOutput);

        expect(branchesService.update).not.toHaveBeenCalled();
      },
    );

    it.for([
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode/apps/api/package.json": {
              languageSlug: "json",
              timeSpent: 600,
              fileName: "package.json",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "main",
            },
            "/home/user/projects/mooncode/apps/api/main.ts": {
              languageSlug: "typescript",
              timeSpent: 2000,
              fileName: "main.ts",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "test",
            },
            "/home/user/projects/factory/Dockerfile": {
              languageSlug: "docker",
              timeSpent: 800,
              fileName: "Dockerfile",
              projectName: "factory",
              projectPath: "/home/user/projects/factory",
              branchName: "main",
            },
          },
          targetedDate: "2026-06-21",
          type: "old" as const,
        },
        mockedOutput: {
          "/home/user/projects/mooncode/apps/api/package.json": {
            languageSlug: "json",
            timeSpent: 600,
            fileName: "package.json",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "main",
          },
          "/home/user/projects/mooncode/apps/api/main.ts": {
            languageSlug: "typescript",
            timeSpent: 2000,
            fileName: "main.ts",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "test",
          },
          "/home/user/projects/factory/Dockerfile": {
            languageSlug: "docker",
            timeSpent: 1000,
            fileName: "Dockerfile",
            projectName: "factory",
            projectPath: "/home/user/projects/factory",
            branchName: "main",
          },
        },
      },
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode": {
              main: {
                "/home/user/projects/mooncode/apps/api/package.json": {
                  languageSlug: "json",
                  timeSpent: 600,
                  fileName: "package.json",
                  projectName: "mooncode",
                },
              },
              test: {
                "/home/user/projects/mooncode/apps/api/main.ts": {
                  languageSlug: "typescript",
                  timeSpent: 2000,
                  fileName: "main.ts",
                  projectName: "mooncode",
                },
              },
            },
            "/home/user/projects/factory": {
              main: {
                "/home/user/projects/factory/Dockerfile": {
                  languageSlug: "docker",
                  timeSpent: 800,
                  fileName: "Dockerfile",
                  projectName: "factory",
                },
              },
            },
          } as Record<
            string,
            Record<
              string,
              Record<
                string,
                {
                  timeSpent: number;
                  languageSlug: string;
                  projectName: string;
                  fileName: string;
                }
              >
            >
          >,
          targetedDate: "2026-06-21",
          type: "new" as const,
        },
        mockedOutput: {
          "/home/user/projects/mooncode": {
            main: {
              "/home/user/projects/mooncode/apps/api/package.json": {
                languageSlug: "json",
                timeSpent: 600,
                fileName: "package.json",
                projectName: "mooncode",
              },
            },
            test: {
              "/home/user/projects/mooncode/apps/api/main.ts": {
                languageSlug: "typescript",
                timeSpent: 2000,
                fileName: "main.ts",
                projectName: "mooncode",
              },
            },
          },
          "/home/user/projects/factory": {
            main: {
              "/home/user/projects/factory/Dockerfile": {
                languageSlug: "docker",
                timeSpent: 1000,
                fileName: "Dockerfile",
                projectName: "factory",
              },
            },
          },
        },
      },
    ])(
      "should ONLY update branches where the new time spent is greater than the existing one",
      async ({ mockedEntry, mockedOutput }) => {
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

        branchesService.findOne
          .mockResolvedValueOnce({
            id: "5",
            name: "main",
            timeSpent: 500,
          })
          .mockResolvedValueOnce({
            id: "6",
            name: "test",
            timeSpent: 1800,
          })
          .mockResolvedValueOnce({
            id: "7",
            name: "main",
            timeSpent: 1000,
          });

        branchesService.update
          .mockResolvedValueOnce({
            projectId: "3",
            name: "main",
            timeSpent: 600,
          })
          .mockResolvedValueOnce({
            projectId: "3",
            name: "test",
            timeSpent: 2000,
          });

        filesService.findAllOnDay.mockResolvedValue([
          {
            languageSlug: "json",
            timeSpent: 500,
            fileName: "package.json",
            filePath: "/home/user/projects/mooncode/apps/api/package.json",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "main",
          },
          {
            languageSlug: "typescript",
            timeSpent: 1800,
            fileName: "main.ts",
            filePath: "/home/user/projects/mooncode/apps/api/main.ts",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "test",
          },
          {
            languageSlug: "docker",
            timeSpent: 1000,
            fileName: "Dockerfile",
            filePath: "/home/user/projects/factory/Dockerfile",
            projectName: "factory",
            projectPath: "/home/user/projects/factory",
            branchName: "main",
          },
        ]);

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
        expect(filesData).toEqual(mockedOutput);

        expect(branchesService.update).toHaveBeenCalledTimes(2);
        expect(branchesService.update).toHaveBeenNthCalledWith(1, {
          projectId: "3",
          name: "main",
          timeSpent: 600,
        });
        expect(branchesService.update).toHaveBeenNthCalledWith(2, {
          projectId: "3",
          name: "test",
          timeSpent: 2000,
        });
      },
    );

    it.for([
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode/apps/api/package.json": {
              languageSlug: "json",
              timeSpent: 600,
              fileName: "package.json",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "main",
            },
            "/home/user/projects/mooncode/apps/api/main.ts": {
              languageSlug: "typescript",
              timeSpent: 2000,
              fileName: "main.ts",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "test",
            },
            "/home/user/projects/factory/Dockerfile": {
              languageSlug: "docker",
              timeSpent: 1200,
              fileName: "Dockerfile",
              projectName: "factory",
              projectPath: "/home/user/projects/factory",
              branchName: "main",
            },
          },
          targetedDate: "2026-06-21",
          type: "old" as const,
        },
        mockedOutput: {
          "/home/user/projects/mooncode/apps/api/package.json": {
            languageSlug: "json",
            timeSpent: 600,
            fileName: "package.json",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "main",
          },
          "/home/user/projects/mooncode/apps/api/tsconfig.json": {
            languageSlug: "json",
            timeSpent: 200,
            fileName: "tsconfig.json",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "main",
          },
          "/home/user/projects/mooncode/apps/api/main.ts": {
            languageSlug: "typescript",
            timeSpent: 2000,
            fileName: "main.ts",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "test",
          },
          "/home/user/projects/mooncode/apps/api/src/auth/auth.service.ts": {
            languageSlug: "typescript",
            timeSpent: 600,
            fileName: "auth.service.ts",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "test",
          },
          "/home/user/projects/factory/Dockerfile": {
            languageSlug: "docker",
            timeSpent: 1200,
            fileName: "Dockerfile",
            projectName: "factory",
            projectPath: "/home/user/projects/factory",
            branchName: "main",
          },
        },
      },
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode": {
              main: {
                "/home/user/projects/mooncode/apps/api/package.json": {
                  languageSlug: "json",
                  timeSpent: 600,
                  fileName: "package.json",
                  projectName: "mooncode",
                },
              },
              test: {
                "/home/user/projects/mooncode/apps/api/main.ts": {
                  languageSlug: "typescript",
                  timeSpent: 2000,
                  fileName: "main.ts",
                  projectName: "mooncode",
                },
              },
            },
            "/home/user/projects/factory": {
              main: {
                "/home/user/projects/factory/Dockerfile": {
                  languageSlug: "docker",
                  timeSpent: 1200,
                  fileName: "Dockerfile",
                  projectName: "factory",
                },
              },
            },
          } as Record<
            string,
            Record<
              string,
              Record<
                string,
                {
                  timeSpent: number;
                  languageSlug: string;
                  projectName: string;
                  fileName: string;
                }
              >
            >
          >,
          targetedDate: "2026-06-21",
          type: "new" as const,
        },
        mockedOutput: {
          "/home/user/projects/mooncode": {
            main: {
              "/home/user/projects/mooncode/apps/api/tsconfig.json": {
                languageSlug: "json",
                timeSpent: 200,
                fileName: "tsconfig.json",
                projectName: "mooncode",
              },
              "/home/user/projects/mooncode/apps/api/package.json": {
                languageSlug: "json",
                timeSpent: 600,
                fileName: "package.json",
                projectName: "mooncode",
              },
            },
            test: {
              "/home/user/projects/mooncode/apps/api/src/auth/auth.service.ts":
                {
                  languageSlug: "typescript",
                  timeSpent: 600,
                  fileName: "auth.service.ts",
                  projectName: "mooncode",
                },
              "/home/user/projects/mooncode/apps/api/main.ts": {
                languageSlug: "typescript",
                timeSpent: 2000,
                fileName: "main.ts",
                projectName: "mooncode",
              },
            },
          },
          "/home/user/projects/factory": {
            main: {
              "/home/user/projects/factory/Dockerfile": {
                languageSlug: "docker",
                timeSpent: 1200,
                fileName: "Dockerfile",
                projectName: "factory",
              },
            },
          },
        },
      },
    ])(
      "should create the file for the day if it doesn't exist",
      async ({ mockedEntry, mockedOutput }) => {
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

        branchesService.findOne
          .mockResolvedValueOnce({
            id: "5",
            name: "main",
            timeSpent: 200,
          })
          .mockResolvedValueOnce({
            id: "6",
            name: "test",
            timeSpent: 600,
          })
          .mockResolvedValueOnce({
            id: "7",
            name: "main",
            timeSpent: 1100,
          });

        branchesService.update
          .mockResolvedValueOnce({
            projectId: "3",
            name: "main",
            timeSpent: 800,
          })
          .mockResolvedValueOnce({
            projectId: "3",
            name: "test",
            timeSpent: 2600,
          })
          .mockResolvedValueOnce({
            projectId: "4",
            name: "main",
            timeSpent: 2300,
          });

        filesService.findAllOnDay.mockResolvedValue([
          {
            languageSlug: "json",
            timeSpent: 200,
            fileName: "tsconfig.json",
            filePath: "/home/user/projects/mooncode/apps/api/tsconfig.json",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "main",
          },
          {
            languageSlug: "typescript",
            timeSpent: 600,
            fileName: "auth.service.ts",
            filePath:
              "/home/user/projects/mooncode/apps/api/src/auth/auth.service.ts",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "test",
          },
          {
            languageSlug: "docker",
            timeSpent: 1100,
            fileName: "Dockerfile",
            filePath: "/home/user/projects/factory/Dockerfile",
            projectPath: "/home/user/projects/factory",
            projectName: "factory",
            branchName: "main",
          },
        ]);

        languagesService.findOne
          .mockResolvedValueOnce({
            timeSpent: 200,
            languageSlug: "json",
            languageId: "11",
          })
          .mockResolvedValueOnce({
            timeSpent: 350,
            languageSlug: "typescript",
            languageId: "12",
          })
          .mockResolvedValue({
            timeSpent: 300,
            languageSlug: "docker",
            languageId: "13",
          });

        filesService.findOne
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({
            name: "Dockerfile",
            path: "/home/user/projects/factory/Dockerfile",
            timeSpent: 1000,
          });

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
          });

        filesService.update.mockResolvedValueOnce({
          name: "Dockerfile",
          path: "/home/user/projects/factory/Dockerfile",
          timeSpent: 1200,
        });

        const filesData = await extensionService.upsertFiles(mockedEntry);
        expect(filesData).toBeDefined();
        expect(filesData).toEqual(mockedOutput);

        expect(filesService.create).toHaveBeenCalled();
        expect(filesService.create).toHaveBeenCalledTimes(2);
        expect(filesService.create).toHaveBeenNthCalledWith(1, {
          languageId: "11",
          branchId: "5",
          path: "/home/user/projects/mooncode/apps/api/package.json",
          timeSpent: 600,
          name: "package.json",
        });
        expect(filesService.create).toHaveBeenNthCalledWith(2, {
          languageId: "12",
          branchId: "6",
          path: "/home/user/projects/mooncode/apps/api/main.ts",
          timeSpent: 2000,
          name: "main.ts",
        });
      },
    );

    it.for([
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode/apps/api/package.json": {
              languageSlug: "json",
              timeSpent: 600,
              fileName: "package.json",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "main",
            },
            "/home/user/projects/mooncode/apps/api/main.ts": {
              languageSlug: "typescript",
              timeSpent: 2000,
              fileName: "main.ts",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "test",
            },
            "/home/user/projects/factory/Dockerfile": {
              languageSlug: "docker",
              timeSpent: 1200,
              fileName: "Dockerfile",
              projectName: "factory",
              projectPath: "/home/user/projects/factory",
              branchName: "main",
            },
          },
          targetedDate: "2026-06-21",
          type: "old" as const,
        },
      },
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode": {
              main: {
                "/home/user/projects/mooncode/apps/api/package.json": {
                  languageSlug: "json",
                  timeSpent: 600,
                  fileName: "package.json",
                  projectName: "mooncode",
                },
              },
              test: {
                "/home/user/projects/mooncode/apps/api/main.ts": {
                  languageSlug: "typescript",
                  timeSpent: 2000,
                  fileName: "main.ts",
                  projectName: "mooncode",
                },
              },
            },
            "/home/user/projects/factory": {
              main: {
                "/home/user/projects/factory/Dockerfile": {
                  languageSlug: "docker",
                  timeSpent: 1200,
                  fileName: "Dockerfile",
                  projectName: "factory",
                },
              },
            },
          } as Record<
            string,
            Record<
              string,
              Record<
                string,
                {
                  timeSpent: number;
                  languageSlug: string;
                  projectName: string;
                  fileName: string;
                }
              >
            >
          >,
          targetedDate: "2026-06-21",
          type: "new" as const,
        },
      },
    ])(
      "should update the file data for the day if it exists and the new time spent is greater than the existing one",
      async ({ mockedEntry }) => {
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

        branchesService.findOne
          .mockResolvedValueOnce({
            id: "5",
            name: "main",
            timeSpent: 200,
          })
          .mockResolvedValueOnce({
            id: "6",
            name: "test",
            timeSpent: 1800,
          })
          .mockResolvedValueOnce({
            id: "7",
            name: "main",
            timeSpent: 1000,
          });

        branchesService.update
          .mockResolvedValueOnce({
            projectId: "3",
            name: "main",
            timeSpent: 600,
          })
          .mockResolvedValueOnce({
            projectId: "3",
            name: "test",
            timeSpent: 2000,
          })
          .mockResolvedValueOnce({
            projectId: "4",
            name: "main",
            timeSpent: 1200,
          });

        filesService.findAllOnDay.mockResolvedValue([
          {
            languageSlug: "json",
            timeSpent: 200,
            fileName: "package.json",
            filePath: "/home/user/projects/mooncode/apps/api/package.json",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "main",
          },
          {
            languageSlug: "typescript",
            timeSpent: 1800,
            fileName: "main.ts",
            filePath: "/home/user/projects/mooncode/apps/api/main.ts",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "test",
          },
          {
            languageSlug: "docker",
            timeSpent: 1000,
            fileName: "Dockerfile",
            filePath: "/home/user/projects/factory/Dockerfile",
            projectName: "factory",
            projectPath: "/home/user/projects/factory",
            branchName: "main",
          },
        ]);

        languagesService.findOne
          .mockResolvedValueOnce({
            timeSpent: 200,
            languageSlug: "json",
            languageId: "8",
          })
          .mockResolvedValueOnce({
            timeSpent: 1800,
            languageSlug: "typescript",
            languageId: "9",
          })
          .mockResolvedValue({
            timeSpent: 1000,
            languageSlug: "docker",
            languageId: "10",
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
          branchId: "5",
          languageId: "8",
          path: "/home/user/projects/mooncode/apps/api/package.json",
          timeSpent: 600,
          name: "package.json",
        });
        expect(filesService.update).toHaveBeenNthCalledWith(2, {
          branchId: "6",
          languageId: "9",
          path: "/home/user/projects/mooncode/apps/api/main.ts",
          timeSpent: 2000,
          name: "main.ts",
        });
        expect(filesService.update).toHaveBeenNthCalledWith(3, {
          branchId: "7",
          languageId: "10",
          path: "/home/user/projects/factory/Dockerfile",
          timeSpent: 1200,
          name: "Dockerfile",
        });
      },
    );

    it.for([
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode/apps/api/package.json": {
              languageSlug: "json",
              timeSpent: 400,
              fileName: "package.json",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "main",
            },
            "/home/user/projects/mooncode/apps/api/main.ts": {
              languageSlug: "typescript",
              timeSpent: 1000,
              fileName: "main.ts",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "test",
            },
            "/home/user/projects/factory/Dockerfile": {
              languageSlug: "docker",
              timeSpent: 800,
              fileName: "Dockerfile",
              projectName: "factory",
              projectPath: "/home/user/projects/factory",
              branchName: "main",
            },
          },
          targetedDate: "2026-06-21",
          type: "old" as const,
        },
        mockedOutput: {
          "/home/user/projects/mooncode/apps/api/package.json": {
            languageSlug: "json",
            timeSpent: 500,
            fileName: "package.json",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "main",
          },
          "/home/user/projects/mooncode/apps/api/main.ts": {
            languageSlug: "typescript",
            timeSpent: 1800,
            fileName: "main.ts",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "test",
          },
          "/home/user/projects/factory/Dockerfile": {
            languageSlug: "docker",
            timeSpent: 1000,
            fileName: "Dockerfile",
            projectName: "factory",
            projectPath: "/home/user/projects/factory",
            branchName: "main",
          },
        },
      },
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode": {
              main: {
                "/home/user/projects/mooncode/apps/api/package.json": {
                  languageSlug: "json",
                  timeSpent: 400,
                  fileName: "package.json",
                  projectName: "mooncode",
                },
              },
              test: {
                "/home/user/projects/mooncode/apps/api/main.ts": {
                  languageSlug: "typescript",
                  timeSpent: 1000,
                  fileName: "main.ts",
                  projectName: "mooncode",
                },
              },
            },
            "/home/user/projects/factory": {
              main: {
                "/home/user/projects/factory/Dockerfile": {
                  languageSlug: "docker",
                  timeSpent: 800,
                  fileName: "Dockerfile",
                  projectName: "factory",
                },
              },
            },
          } as Record<
            string,
            Record<
              string,
              Record<
                string,
                {
                  timeSpent: number;
                  languageSlug: string;
                  projectName: string;
                  fileName: string;
                }
              >
            >
          >,
          targetedDate: "2026-06-21",
          type: "new" as const,
        },
        mockedOutput: {
          "/home/user/projects/mooncode": {
            main: {
              "/home/user/projects/mooncode/apps/api/package.json": {
                languageSlug: "json",
                timeSpent: 500,
                fileName: "package.json",
                projectName: "mooncode",
              },
            },
            test: {
              "/home/user/projects/mooncode/apps/api/main.ts": {
                languageSlug: "typescript",
                timeSpent: 1800,
                fileName: "main.ts",
                projectName: "mooncode",
              },
            },
          },
          "/home/user/projects/factory": {
            main: {
              "/home/user/projects/factory/Dockerfile": {
                languageSlug: "docker",
                timeSpent: 1000,
                fileName: "Dockerfile",
                projectName: "factory",
              },
            },
          },
        },
      },
    ])(
      "should NOT update the file data for the day if it exists and the new time spent is less than the existing one",
      async ({ mockedEntry, mockedOutput }) => {
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

        branchesService.findOne
          .mockResolvedValueOnce({
            id: "5",
            name: "main",
            timeSpent: 500,
          })
          .mockResolvedValueOnce({
            id: "6",
            name: "test",
            timeSpent: 1800,
          })
          .mockResolvedValueOnce({
            id: "7",
            name: "main",
            timeSpent: 1000,
          });

        filesService.findAllOnDay.mockResolvedValue([
          {
            languageSlug: "json",
            timeSpent: 500,
            fileName: "package.json",
            filePath: "/home/user/projects/mooncode/apps/api/package.json",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "main",
          },
          {
            languageSlug: "typescript",
            timeSpent: 1800,
            fileName: "main.ts",
            filePath: "/home/user/projects/mooncode/apps/api/main.ts",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "test",
          },
          {
            languageSlug: "docker",
            timeSpent: 1000,
            fileName: "Dockerfile",
            filePath: "/home/user/projects/factory/Dockerfile",
            projectName: "factory",
            projectPath: "/home/user/projects/factory",
            branchName: "main",
          },
        ]);

        languagesService.findOne
          .mockResolvedValueOnce({
            timeSpent: 500,
            languageSlug: "json",
            languageId: "8",
          })
          .mockResolvedValueOnce({
            timeSpent: 1800,
            languageSlug: "typescript",
            languageId: "9",
          })
          .mockResolvedValue({
            timeSpent: 1000,
            languageSlug: "docker",
            languageId: "10",
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
        expect(filesData).toEqual(mockedOutput);

        expect(filesService.update).not.toHaveBeenCalled();
      },
    );

    it.for([
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode/apps/api/package.json": {
              languageSlug: "json",
              timeSpent: 600,
              fileName: "package.json",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "main",
            },
            "/home/user/projects/mooncode/apps/api/main.ts": {
              languageSlug: "typescript",
              timeSpent: 2000,
              fileName: "main.ts",
              projectName: "mooncode",
              projectPath: "/home/user/projects/mooncode",
              branchName: "test",
            },
            "/home/user/projects/factory/Dockerfile": {
              languageSlug: "docker",
              timeSpent: 800,
              fileName: "Dockerfile",
              projectName: "factory",
              projectPath: "/home/user/projects/factory",
              branchName: "main",
            },
          },
          targetedDate: "2026-06-21",
          type: "old" as const,
        },
        mockedOutput: {
          "/home/user/projects/mooncode/apps/api/package.json": {
            languageSlug: "json",
            timeSpent: 600,
            fileName: "package.json",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "main",
          },
          "/home/user/projects/mooncode/apps/api/main.ts": {
            languageSlug: "typescript",
            timeSpent: 2000,
            fileName: "main.ts",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "test",
          },
          "/home/user/projects/factory/Dockerfile": {
            languageSlug: "docker",
            timeSpent: 1000,
            fileName: "Dockerfile",
            projectName: "factory",
            projectPath: "/home/user/projects/factory",
            branchName: "main",
          },
        },
      },
      {
        mockedEntry: {
          userId: "1",
          filesData: {
            "/home/user/projects/mooncode": {
              main: {
                "/home/user/projects/mooncode/apps/api/package.json": {
                  languageSlug: "json",
                  timeSpent: 600,
                  fileName: "package.json",
                  projectName: "mooncode",
                },
              },
              test: {
                "/home/user/projects/mooncode/apps/api/main.ts": {
                  languageSlug: "typescript",
                  timeSpent: 2000,
                  fileName: "main.ts",
                  projectName: "mooncode",
                },
              },
            },
            "/home/user/projects/factory": {
              main: {
                "/home/user/projects/factory/Dockerfile": {
                  languageSlug: "docker",
                  timeSpent: 800,
                  fileName: "Dockerfile",
                  projectName: "factory",
                },
              },
            },
          } as Record<
            string,
            Record<
              string,
              Record<
                string,
                {
                  timeSpent: number;
                  languageSlug: string;
                  projectName: string;
                  fileName: string;
                }
              >
            >
          >,
          targetedDate: "2026-06-21",
          type: "new" as const,
        },
        mockedOutput: {
          "/home/user/projects/mooncode": {
            main: {
              "/home/user/projects/mooncode/apps/api/package.json": {
                languageSlug: "json",
                timeSpent: 600,
                fileName: "package.json",
                projectName: "mooncode",
              },
            },
            test: {
              "/home/user/projects/mooncode/apps/api/main.ts": {
                languageSlug: "typescript",
                timeSpent: 2000,
                fileName: "main.ts",
                projectName: "mooncode",
              },
            },
          },
          "/home/user/projects/factory": {
            main: {
              "/home/user/projects/factory/Dockerfile": {
                languageSlug: "docker",
                timeSpent: 1000,
                fileName: "Dockerfile",
                projectName: "factory",
              },
            },
          },
        },
      },
    ])(
      "should ONLY update files where the new time spent is greater than the existing one",
      async ({ mockedEntry, mockedOutput }) => {
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

        branchesService.findOne
          .mockResolvedValueOnce({
            id: "5",
            name: "main",
            timeSpent: 500,
          })
          .mockResolvedValueOnce({
            id: "6",
            name: "test",
            timeSpent: 1800,
          })
          .mockResolvedValueOnce({
            id: "7",
            name: "main",
            timeSpent: 1000,
          });

        branchesService.update
          .mockResolvedValueOnce({
            projectId: "3",
            name: "main",
            timeSpent: 600,
          })
          .mockResolvedValueOnce({
            projectId: "3",
            name: "test",
            timeSpent: 2000,
          });

        filesService.findAllOnDay.mockResolvedValue([
          {
            languageSlug: "json",
            timeSpent: 500,
            fileName: "package.json",
            filePath: "/home/user/projects/mooncode/apps/api/package.json",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "main",
          },
          {
            languageSlug: "typescript",
            timeSpent: 1800,
            fileName: "main.ts",
            filePath: "/home/user/projects/mooncode/apps/api/main.ts",
            projectName: "mooncode",
            projectPath: "/home/user/projects/mooncode",
            branchName: "test",
          },
          {
            languageSlug: "docker",
            timeSpent: 1000,
            fileName: "Dockerfile",
            filePath: "/home/user/projects/factory/Dockerfile",
            projectName: "factory",
            projectPath: "/home/user/projects/factory",
            branchName: "main",
          },
        ]);

        languagesService.findOne
          .mockResolvedValueOnce({
            timeSpent: 500,
            languageSlug: "json",
            languageId: "8",
          })
          .mockResolvedValueOnce({
            timeSpent: 1800,
            languageSlug: "typescript",
            languageId: "9",
          })
          .mockResolvedValue({
            timeSpent: 1000,
            languageSlug: "docker",
            languageId: "10",
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
        expect(filesData).toEqual(mockedOutput);

        expect(filesService.update).toHaveBeenCalledTimes(2);
        expect(filesService.update).toHaveBeenNthCalledWith(1, {
          branchId: "5",
          languageId: "8",
          path: "/home/user/projects/mooncode/apps/api/package.json",
          timeSpent: 600,
          name: "package.json",
        });
        expect(filesService.update).toHaveBeenNthCalledWith(2, {
          branchId: "6",
          languageId: "9",
          path: "/home/user/projects/mooncode/apps/api/main.ts",
          timeSpent: 2000,
          name: "main.ts",
        });
      },
    );
  });
});
