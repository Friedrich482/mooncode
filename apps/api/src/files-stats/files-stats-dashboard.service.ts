import getWeekDayName from "src/common/utils/getWeekdayName";
import { ProjectsService } from "src/projects/projects.service";

import { Injectable } from "@nestjs/common";
import formatDuration from "@repo/common/formatDuration";

import {
  CheckProjectExistsDtoType,
  GetPeriodProjectsDtoType,
  GetProjectFilesOnPeriodDtoType,
  GetProjectLanguagesPerDayOfPeriodDtoType,
  GetProjectLanguagesTimeOnPeriodType,
  GetProjectOnPeriodDtoType,
  GetProjectPerDayOfPeriodDtoType,
} from "./files-stats.dto";
import getProjectLanguageGroupByMonths from "./utils/getProjectLanguageGroupByMonths";
import getProjectLanguagesGroupByWeeks from "./utils/getProjectLanguagesGroupByWeeks";
import getProjectPerDayOfPeriodGroupByMonths from "./utils/getProjectPerDayOfPeriodGroupByMonths";
import getProjectPerDayOfPeriodGroupByWeeks from "./utils/getProjectPerDayOfPeriodGroupByWeeks";

@Injectable()
export class FilesStatsDashboardService {
  constructor(private readonly projectsService: ProjectsService) {}

  async checkProjectExits(checkProjectExitsDto: CheckProjectExistsDtoType) {
    return this.projectsService.checkProjectExists(checkProjectExitsDto);
  }

  async getPeriodProjects(getPeriodProjectsDto: GetPeriodProjectsDtoType) {
    const { userId, start, end } = getPeriodProjectsDto;

    const projectsOnRange = await this.projectsService.findAllRangeProjects({
      userId,
      start,
      end,
    });

    const timeSpentAcrossAllProjects = projectsOnRange.reduce(
      (acc, value) => acc + value.totalTimeSpent,
      0
    );

    const finalData = projectsOnRange.map((project) => ({
      ...project,
      percentage:
        timeSpentAcrossAllProjects === 0
          ? 0
          : parseFloat(
              (
                (project.totalTimeSpent * 100) /
                timeSpentAcrossAllProjects
              ).toFixed(2)
            ),
    }));

    return finalData;
  }

  async getProjectOnPeriod(getProjectOnPeriodDto: GetProjectOnPeriodDtoType) {
    const { userId, start, end, name } = getProjectOnPeriodDto;

    const project = await this.projectsService.groupAndAggregateProjectByName({
      start,
      end,
      userId,
      name,
    });

    return project;
  }

  async getProjectPerDayOfPeriod(
    getProjectPerDayOfPeriodDto: GetProjectPerDayOfPeriodDtoType
  ) {
    const { userId, start, end, name, groupBy, periodResolution } =
      getProjectPerDayOfPeriodDto;

    const dailyProjectsForPeriod =
      await this.projectsService.findProjectByNameOnRange({
        userId,
        start,
        end,
        name,
      });

    if (dailyProjectsForPeriod.length === 0) return [];

    switch (groupBy) {
      case "weeks":
        return getProjectPerDayOfPeriodGroupByWeeks(
          dailyProjectsForPeriod,
          periodResolution
        );

      case "months":
        return getProjectPerDayOfPeriodGroupByMonths(dailyProjectsForPeriod);

      default:
        break;
    }

    return dailyProjectsForPeriod.map(({ timeSpent, date }) => ({
      timeSpentLine: timeSpent,
      timeSpentBar: timeSpent,
      timeSpentArea: timeSpent,
      value: formatDuration(timeSpent),
      originalDate: new Date(date).toDateString(),
      date: getWeekDayName(date),
    }));
  }

  async getProjectLanguagesTimeOnPeriod(
    getProjectLanguagesTimeOnPeriod: GetProjectLanguagesTimeOnPeriodType
  ) {
    const { userId, start, end, name } = getProjectLanguagesTimeOnPeriod;

    const dailyProjectsForPeriod =
      await this.projectsService.findProjectByNameOnRange({
        userId,
        start,
        end,
        name,
      });

    if (dailyProjectsForPeriod.length === 0) return [];

    const totalTimeSpentOnProjectOnPeriod = (
      await this.getProjectOnPeriod({
        userId,
        start,
        end,
        name,
      })
    ).totalTimeSpent;

    const aggregatedLanguageTime =
      await this.projectsService.getProjectLanguagesTimeOnPeriod({
        userId,
        start,
        end,
        name,
      });

    return Object.entries(aggregatedLanguageTime)
      .map(([languageSlug, timeSpent]) => ({
        languageSlug,
        time: timeSpent,
        value: formatDuration(timeSpent),
        percentage:
          totalTimeSpentOnProjectOnPeriod === 0
            ? 0
            : parseFloat(
                ((timeSpent * 100) / totalTimeSpentOnProjectOnPeriod).toFixed(2)
              ),
      }))
      .sort((a, b) => a.time - b.time);
  }

  async getProjectLanguagesPerDayOfPeriod(
    getProjectLanguagesPerDayOfPeriodDto: GetProjectLanguagesPerDayOfPeriodDtoType
  ) {
    const { userId, start, end, name, groupBy, periodResolution } =
      getProjectLanguagesPerDayOfPeriodDto;

    const dailyProjectsForPeriod =
      await this.projectsService.findProjectByNameOnRange({
        userId,
        start,
        end,
        name,
      });

    if (dailyProjectsForPeriod.length === 0) return [];

    const languagesTimesPerDayOfPeriod =
      await this.projectsService.getProjectLanguagesTimePerDayOfPeriod({
        userId,
        start,
        end,
        name,
      });

    switch (groupBy) {
      case "weeks":
        return getProjectLanguagesGroupByWeeks(
          dailyProjectsForPeriod,
          periodResolution,
          languagesTimesPerDayOfPeriod
        );

      case "months":
        return getProjectLanguageGroupByMonths(
          dailyProjectsForPeriod,
          languagesTimesPerDayOfPeriod
        );

      default:
        break;
    }

    return dailyProjectsForPeriod.map(({ timeSpent, date }) => ({
      timeSpent,
      originalDate: new Date(date).toDateString(),
      date: getWeekDayName(date),
      ...(languagesTimesPerDayOfPeriod[date] ?? {}),
    }));
  }

  async getProjectFilesOnPeriod(
    getProjectFilesOnPeriodDto: GetProjectFilesOnPeriodDtoType
  ) {
    const data = await this.projectsService.getAllProjectFilesOnPeriod(
      getProjectFilesOnPeriodDto
    );

    return data;
  }
}
