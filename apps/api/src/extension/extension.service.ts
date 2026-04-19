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
      // else update it but only if the new timeSpent is greater than the existing one
      if (existingTimeSpentOnDay.timeSpent < timeSpentOnDay) {
        const updatedTimeSpentOnDay = await this.dailyDataService.update({
          timeSpent: timeSpentOnDay,
          userId,
          targetedDate,
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
          dailyDataId: returningData.dailyDataId,
          timeSpent: timeSpentOnLanguage,
          languageSlug,
        });

        returningData.languages[createdLanguageData.languageSlug] =
          createdLanguageData.timeSpent;
      } else {
        // else update it but only if the new timeSpent is greater than the existing one
        if (existingLanguageData.timeSpent < timeSpentOnLanguage) {
          const updatedLanguageData = await this.languagesService.update({
            timeSpent: timeSpentOnLanguage,
            dailyDataId: returningData.dailyDataId,
            languageSlug,
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
    const { userId, filesData, timeSpentPerProject, targetedDate } =
      upsertFilesDto;

    // This projectData object is reused for each file's project,
    // which means its values will be overwritten in each iteration.
    // It primarily serves to pass the projectId to the file creation/update.
    const projectData = {
      projectId: "",
      projectName: "",
      timeSpent: 0,
    };

    const dailyDataForDay = await this.dailyDataService.findOne({
      userId,
      date: targetedDate,
    });

    if (!dailyDataForDay) {
      // early exit - nothing to upsert
      return {};
    }

    const returningData = await this.filesService.findAllOnDay({
      dailyDataId: dailyDataForDay.id,
    });

    for (const [path, file] of Object.entries(filesData)) {
      const existingProject = await this.projectsService.findOne({
        dailyDataId: dailyDataForDay.id,
        name: file.projectName,
        path: file.projectPath,
      });

      if (!existingProject) {
        // if the project doesn't exist, let's create it
        const createdProject = await this.projectsService.create({
          dailyDataId: dailyDataForDay.id,
          name: file.projectName,
          path: file.projectPath,
          timeSpent: timeSpentPerProject[file.projectPath],
        });

        projectData.projectId = createdProject.id;
        projectData.projectName = createdProject.name;
        projectData.timeSpent = createdProject.timeSpent;
      } else {
        // else update it but only if the new time spent is greater than the existing one
        if (
          existingProject.timeSpent <= timeSpentPerProject[file.projectPath]
        ) {
          await this.projectsService.update({
            dailyDataId: dailyDataForDay.id,
            name: file.projectName,
            path: file.projectPath,
            timeSpent: timeSpentPerProject[file.projectPath],
          });
          projectData.timeSpent = timeSpentPerProject[file.projectPath];
        } else {
          projectData.timeSpent = existingProject.timeSpent;
        }

        projectData.projectId = existingProject.id;
        projectData.projectName = existingProject.name;
      }

      const fileLanguage = await this.languagesService.findOne({
        dailyDataId: dailyDataForDay.id,
        languageSlug: file.languageSlug,
      });

      // must exist at this point
      if (!fileLanguage) {
        continue;
      }

      const existingFileData = await this.filesService.findOne({
        projectId: projectData.projectId,
        name: file.fileName,
        path,
        languageId: fileLanguage.languageId,
      });

      if (!existingFileData) {
        // if the data for this file doesn't exist, create one
        await this.filesService.create({
          projectId: projectData.projectId,
          languageId: fileLanguage.languageId,
          name: file.fileName,
          path,
          timeSpent: file.timeSpent,
        });

        returningData[path] = {
          languageSlug: file.languageSlug,
          projectName: file.projectName,
          projectPath: file.projectPath,
          timeSpent: file.timeSpent,
          fileName: file.fileName,
        };
      } else {
        // else just update the file data but only if the new timeSpent is greater than the existing one
        if (existingFileData.timeSpent <= file.timeSpent) {
          await this.filesService.update({
            projectId: projectData.projectId,
            languageId: fileLanguage.languageId,
            path,
            timeSpent: file.timeSpent,
            name: file.fileName,
          });

          returningData[path] = {
            languageSlug: file.languageSlug,
            projectName: file.projectName,
            projectPath: file.projectPath,
            timeSpent: file.timeSpent,
            fileName: file.fileName,
          };
        } else {
          returningData[path] = {
            languageSlug: file.languageSlug,
            projectName: file.projectName,
            projectPath: file.projectPath,
            fileName: file.fileName,
            timeSpent: existingFileData.timeSpent,
          };
        }
      }
    }
    return returningData;
  }
}
