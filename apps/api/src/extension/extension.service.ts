import { DailyDataService } from "@/daily-data/daily-data.service";
import { FilesService } from "@/files/files.service";
import { LanguagesService } from "@/languages/languages.service";
import { ProjectsService } from "@/projects/projects.service";
import { Injectable } from "@nestjs/common";

import {
  GetFilesForDayDtoType,
  GetLanguagesTimeForDayDtoType,
  UpsertFilesDtoType,
  UpsertLanguagesDtoType,
} from "./extension.dto";

@Injectable()
export class ExtensionService {
  constructor(
    private readonly dailyDataService: DailyDataService,
    private readonly languagesService: LanguagesService,
    private readonly projectsService: ProjectsService,
    private readonly filesService: FilesService,
  ) {}

  async getLanguagesTimeForDay(
    getLanguagesTimeForDayDto: GetLanguagesTimeForDayDtoType,
  ) {
    const { userId, dateString } = getLanguagesTimeForDayDto;

    const dayData = await this.dailyDataService.findOne({
      userId,
      date: dateString,
    });

    if (!dayData) {
      return {
        timeSpent: 0,
        dayLanguagesTime: {},
      };
    }

    const dayLanguagesTime = await this.languagesService.findAll({
      dailyDataId: dayData.id,
    });

    return { timeSpent: dayData.timeSpent, dayLanguagesTime };
  }

  async getFilesForDay(getFilesForDayDto: GetFilesForDayDtoType) {
    const { userId, dateString } = getFilesForDayDto;

    const dayData = await this.dailyDataService.findOne({
      userId,
      date: dateString,
    });

    if (!dayData) {
      return {};
    }

    const filesData = await this.filesService.findAllOnDay({
      dailyDataId: dayData.id,
    });

    return filesData;
  }

  async upsertLanguages(upsertLanguagesDto: UpsertLanguagesDtoType) {
    const { timeSpentPerLanguage, timeSpentOnDay, targetedDate, userId } =
      upsertLanguagesDto;

    const returningData = {
      dailyDataId: "",
      timeSpentOnDay: 0,
      date: targetedDate,
      languages: {} as { [languageSlug: string]: number },
    };

    const existingTimeSpentOnDay = await this.dailyDataService.findOne({
      userId,
      date: targetedDate,
    });

    if (!existingTimeSpentOnDay) {
      // create daily data if it doesn't exists
      const createdTimeSpentOnDay = await this.dailyDataService.create({
        targetedDate,
        timeSpent: timeSpentOnDay,
        userId,
      });

      returningData.dailyDataId = createdTimeSpentOnDay.id;
      returningData.timeSpentOnDay = createdTimeSpentOnDay.timeSpent;
      returningData.date = createdTimeSpentOnDay.date;
    } else {
      // update it but only if the new timeSpent is greater than the existing one
      if (existingTimeSpentOnDay.timeSpent < timeSpentOnDay) {
        const updatedTimeSpentOnDay = await this.dailyDataService.update({
          targetedDate,
          timeSpent: timeSpentOnDay,
          userId,
        });

        returningData.dailyDataId = updatedTimeSpentOnDay.id;
        returningData.timeSpentOnDay = updatedTimeSpentOnDay.timeSpent;
        returningData.date = updatedTimeSpentOnDay.date;
      } else {
        returningData.dailyDataId = existingTimeSpentOnDay.id;
        returningData.timeSpentOnDay = existingTimeSpentOnDay.timeSpent;
        returningData.date = targetedDate;
      }
    }

    for (const [languageSlug, timeSpentOnLanguage] of Object.entries(
      timeSpentPerLanguage,
    )) {
      const existingLanguageData = await this.languagesService.findOne({
        dailyDataId: returningData.dailyDataId,
        languageSlug,
      });

      if (!existingLanguageData) {
        // if it doesn't exists, create it for each language
        const createdLanguageData = await this.languagesService.create({
          languageSlug,
          timeSpent: timeSpentOnLanguage,
          dailyDataId: returningData.dailyDataId,
        });

        returningData.languages[createdLanguageData.languageSlug] =
          createdLanguageData.timeSpent;
      } else {
        // else update it but only if the new timeSpent is greater than the existing one
        if (existingLanguageData.timeSpent < timeSpentOnLanguage) {
          const updatedLanguageData = await this.languagesService.update({
            languageSlug,
            timeSpent: timeSpentOnLanguage,
            dailyDataId: returningData.dailyDataId,
          });
          returningData.languages[updatedLanguageData.languageSlug] =
            updatedLanguageData.timeSpent;
        } else {
          returningData.languages[existingLanguageData.languageSlug] =
            existingLanguageData.timeSpent;
        }
      }
    }

    return returningData;
  }

  async upsertFiles(upsertFilesDto: UpsertFilesDtoType) {
    const { userId, filesData, targetedDate } = upsertFilesDto;

    const dailyDataForDay = await this.dailyDataService.findOne({
      userId,
      date: targetedDate,
    });

    if (!dailyDataForDay) {
      // this is unreachable in practice because the upsertLanguages method must always be called before the upsertFiles method
      // so the dailyData already exists at this point
      return {};
    }

    const projectsData = Object.entries(filesData)
      .map((entry) => ({
        filePath: entry[0],
        ...entry[1],
      }))
      .reduce(
        (acc, curr) => {
          acc[curr.projectPath] = {
            name: acc[curr.projectPath]?.name ?? curr.projectName,
            dailyDataId:
              acc[curr.projectPath]?.dailyDataId ?? dailyDataForDay.id,
            timeSpent: (acc[curr.projectPath]?.timeSpent ?? 0) + curr.timeSpent,
          };

          return acc;
        },
        {} as {
          [path: string]: {
            name: string;
            timeSpent: number;
            dailyDataId: string;
          };
        },
      );

    const updatedProjects: {
      [projectPath: string]: {
        projectId: string;
        projectName: string;
        timeSpent: number;
      };
    } = {};

    for (const [path, project] of Object.entries(projectsData)) {
      const existingProject = await this.projectsService.findOne({
        dailyDataId: dailyDataForDay.id,
        name: project.name,
        path,
      });

      updatedProjects[path] = { projectId: "", projectName: "", timeSpent: 0 };

      if (!existingProject) {
        // if the project doesn't exist, create it
        const createdProject = await this.projectsService.create({
          dailyDataId: dailyDataForDay.id,
          name: project.name,
          path,
          timeSpent: project.timeSpent,
        });

        updatedProjects[path].projectId = createdProject.id;
        updatedProjects[path].projectName = createdProject.name;
        updatedProjects[path].timeSpent = createdProject.timeSpent;
      } else {
        // else update it but only if the new time spent is greater than the existing one
        if (existingProject.timeSpent < project.timeSpent) {
          const updatedProject = await this.projectsService.update({
            dailyDataId: dailyDataForDay.id,
            name: project.name,
            path,
            timeSpent: project.timeSpent,
          });
          updatedProjects[path].timeSpent = updatedProject.timeSpent;
        } else {
          updatedProjects[path].timeSpent = existingProject.timeSpent;
        }

        updatedProjects[path].projectId = existingProject.id;
        updatedProjects[path].projectName = existingProject.name;
      }
    }

    const returningFilesData = await this.filesService.findAllOnDay({
      dailyDataId: dailyDataForDay.id,
    });

    for (const [path, file] of Object.entries(filesData)) {
      const fileLanguage = await this.languagesService.findOne({
        dailyDataId: dailyDataForDay.id,
        languageSlug: file.languageSlug,
      });

      // must exist at this point
      if (!fileLanguage) {
        continue;
      }

      const existingFileData = await this.filesService.findOne({
        projectId: updatedProjects[file.projectPath].projectId,
        name: file.fileName,
        path,
        languageId: fileLanguage.languageId,
      });

      if (!existingFileData) {
        // if the data for this file doesn't exist, create it
        const createdFile = await this.filesService.create({
          projectId: updatedProjects[file.projectPath].projectId,
          languageId: fileLanguage.languageId,
          name: file.fileName,
          path,
          timeSpent: file.timeSpent,
        });

        returningFilesData[createdFile.path] = {
          languageSlug: file.languageSlug,
          projectName: file.projectName,
          projectPath: file.projectPath,
          timeSpent: createdFile.timeSpent,
          fileName: createdFile.name,
        };
      } else {
        // else just update the file data but only if the new timeSpent is greater than the existing one
        if (existingFileData.timeSpent < file.timeSpent) {
          const updatedFile = await this.filesService.update({
            projectId: updatedProjects[file.projectPath].projectId,
            languageId: fileLanguage.languageId,
            path,
            timeSpent: file.timeSpent,
            name: file.fileName,
          });

          returningFilesData[updatedFile.path] = {
            languageSlug: file.languageSlug,
            projectName: file.projectName,
            projectPath: file.projectPath,
            timeSpent: updatedFile.timeSpent,
            fileName: updatedFile.name,
          };
        } else {
          returningFilesData[path] = {
            languageSlug: file.languageSlug,
            projectName: file.projectName,
            projectPath: file.projectPath,
            fileName: file.fileName,
            timeSpent: existingFileData.timeSpent,
          };
        }
      }
    }

    return returningFilesData;
  }
}
