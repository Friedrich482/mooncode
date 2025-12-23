import { DailyDataService } from "src/daily-data/daily-data.service";
import { FilesService } from "src/files/files.service";
import { LanguagesService } from "src/languages/languages.service";
import { ProjectsService } from "src/projects/projects.service";

import { Injectable } from "@nestjs/common";

import {
  GetDailyFilesStatsForExtensionDtoType,
  UpsertFilesStatsDtoType,
} from "./files-stats.dto";

@Injectable()
export class FilesStatsExtensionService {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly filesService: FilesService,
    private readonly dailyDataService: DailyDataService,
    private readonly languagesService: LanguagesService
  ) {}
  async getDailyFilesStatsForExtension(
    getDailyFilesStatsForExtensionDto: GetDailyFilesStatsForExtensionDtoType
  ) {
    const { userId, dateString } = getDailyFilesStatsForExtensionDto;

    const dayData = await this.dailyDataService.findOne({
      userId,
      date: dateString,
    });

    if (!dayData) {
      return {};
    }

    const filesData = await this.filesService.findAllFilesOnDay({
      dailyDataId: dayData.id,
    });

    return filesData;
  }

  async upsert(upsertFilesDto: UpsertFilesStatsDtoType) {
    const { userId, filesData, timeSpentPerProject, targetedDate } =
      upsertFilesDto;

    // This returningProjectData object is reused for each file's project,
    // which means its values will be overwritten in each iteration.
    // It primarily serves to pass the projectId to the file creation/update.
    const returningProjectData = {
      projectId: "",
      projectName: "",
      timeSpent: 0,
    };

    const dailyDataForDay = await this.dailyDataService.findOne({
      userId,
      date: targetedDate,
    });

    if (!dailyDataForDay) {
      // early exit – nothing to upsert
      return {};
    }

    const returningData = await this.filesService.findAllFilesOnDay({
      dailyDataId: dailyDataForDay.id,
    });

    for (const [path, file] of Object.entries(filesData)) {
      const existingProject = await this.projectsService.findOneProject({
        dailyDataId: dailyDataForDay.id,
        name: file.projectName,
        path: file.projectPath,
      });

      if (!existingProject) {
        // if the project doesn't exist, let's create it
        const createdProject = await this.projectsService.createProject({
          dailyDataId: dailyDataForDay.id,
          name: file.projectName,
          path: file.projectPath,
          timeSpent: timeSpentPerProject[file.projectPath],
        });

        returningProjectData.projectId = createdProject.id;
        returningProjectData.projectName = createdProject.name;
        returningProjectData.timeSpent = createdProject.timeSpent;
      } else {
        // else update it but only if the new time spent is greater than the existing one
        if (
          existingProject.timeSpent <= timeSpentPerProject[file.projectPath]
        ) {
          await this.projectsService.updateProject({
            dailyDataId: dailyDataForDay.id,
            name: file.projectName,
            path: file.projectPath,
            timeSpent: timeSpentPerProject[file.projectPath],
          });
          returningProjectData.timeSpent =
            timeSpentPerProject[file.projectPath];
        } else {
          returningProjectData.timeSpent = existingProject.timeSpent;
        }

        returningProjectData.projectId = existingProject.id;
        returningProjectData.projectName = existingProject.name;
      }

      const fileLanguage = await this.languagesService.findOne({
        dailyDataId: dailyDataForDay.id,
        languageSlug: file.languageSlug,
      });

      // must exist too at this point
      if (!fileLanguage) {
        continue;
      }

      const existingFileData = await this.filesService.findOneFile({
        projectId: returningProjectData.projectId,
        name: file.fileName,
        path,
        languageId: fileLanguage.languageId,
      });

      if (!existingFileData) {
        // if the data for this file doesn't exist, create one
        await this.filesService.createFile({
          projectId: returningProjectData.projectId,
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
          await this.filesService.updateFile({
            projectId: returningProjectData.projectId,
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
