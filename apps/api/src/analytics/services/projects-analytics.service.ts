import { eachDayOfInterval } from "date-fns";
import { and, between, desc, eq, inArray, sum } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import {
  CheckProjectExistsDtoType,
  FindProjectByNameOnRangeDtoType,
  GetPeriodProjectsDtoType,
  GetProjectFilesOnPeriodDtoType,
  GetProjectLanguagesPerDayOfPeriodDtoType,
  GetProjectLanguagesTimeOnPeriodDtoType,
  GetProjectLanguagesTimeOnPeriodType,
  GetProjectLanguagesTimePerDayOfPeriodDtoType,
  GetProjectOnPeriodDtoType,
  GetProjectPerDayOfPeriodDtoType,
} from "src/analytics/dto/projects-analytics.dto";
import getProjectLanguageGroupByMonths from "src/analytics/utils/projects/getProjectLanguageGroupByMonths";
import getProjectLanguagesGroupByWeeks from "src/analytics/utils/projects/getProjectLanguagesGroupByWeeks";
import getProjectPerDayOfPeriodGroupByMonths from "src/analytics/utils/projects/getProjectPerDayOfPeriodGroupByMonths";
import getProjectPerDayOfPeriodGroupByWeeks from "src/analytics/utils/projects/getProjectPerDayOfPeriodGroupByWeeks";
import getWeekDayName from "src/common/utils/getWeekdayName";
import { DrizzleAsyncProvider } from "src/drizzle/drizzle.provider";
import { dailyData, files, languages, projects } from "src/drizzle/schema";
import { ProjectsService } from "src/projects/projects.service";

import { Inject, Injectable } from "@nestjs/common";
import convertToISODate from "@repo/common/convertToISODate";
import formatDuration from "@repo/common/formatDuration";
import { TRPCError } from "@trpc/server";

@Injectable()
export class ProjectsAnalyticsService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase,
    private readonly projectsService: ProjectsService
  ) {}

  async findByNameOnRange(
    findProjectByNameOnRangeDto: FindProjectByNameOnRangeDtoType
  ) {
    const { userId, name, start, end } = findProjectByNameOnRangeDto;

    const data = await this.db
      .select({
        date: dailyData.date,
        timeSpent: sum(projects.timeSpent).mapWith(Number),
      })
      .from(projects)
      .innerJoin(dailyData, eq(dailyData.id, projects.dailyDataId))
      .where(
        and(
          eq(dailyData.userId, userId),
          eq(projects.name, name),
          between(dailyData.date, start, end)
        )
      )
      .groupBy(dailyData.date);

    const dateRange = eachDayOfInterval({
      start: new Date(start),
      end: new Date(end),
    });

    const dataByDate = Object.fromEntries(
      data.map((item) => [item.date, item])
    );

    const projectsGroupedByNameOnRange = dateRange.map((date) => {
      const formattedDate = convertToISODate(date);
      return (
        dataByDate[formattedDate] || {
          timeSpent: 0,
          date: formattedDate,
        }
      );
    });

    return projectsGroupedByNameOnRange;
  }

  async getLanguagesTimeOnPeriod(
    getProjectLanguagesTimeOnPeriodDto: GetProjectLanguagesTimeOnPeriodDtoType
  ) {
    const { userId, name, start, end } = getProjectLanguagesTimeOnPeriodDto;

    const aggregated = await this.db
      .select({
        languageSlug: languages.languageSlug,
        totalTime: sum(files.timeSpent).mapWith(Number),
      })
      .from(files)
      .innerJoin(projects, eq(projects.id, files.projectId))
      .innerJoin(dailyData, eq(dailyData.id, projects.dailyDataId))
      .innerJoin(languages, eq(languages.id, files.languageId))
      .where(
        and(
          eq(dailyData.userId, userId),
          eq(projects.name, name),
          between(dailyData.date, start, end)
        )
      )
      .groupBy(languages.languageSlug)
      .orderBy(desc(sum(files.timeSpent).mapWith(Number)));

    const result: { [languageSlug: string]: number } = Object.fromEntries(
      aggregated.map(({ languageSlug, totalTime }) => [languageSlug, totalTime])
    );

    return result;
  }

  async getLanguagesTimePerDayOfPeriod(
    getProjectLanguagesTimePerDayOfPeriodDto: GetProjectLanguagesTimePerDayOfPeriodDtoType
  ) {
    const { userId, name, start, end } =
      getProjectLanguagesTimePerDayOfPeriodDto;

    const languagesPerDayOfPeriod = await this.db
      .select({
        languageSlug: languages.languageSlug,
        timeSpent: files.timeSpent,
        date: dailyData.date,
      })
      .from(files)
      .innerJoin(projects, eq(projects.id, files.projectId))
      .innerJoin(dailyData, eq(dailyData.id, projects.dailyDataId))
      .innerJoin(languages, eq(languages.id, files.languageId))
      .where(
        and(
          eq(dailyData.userId, userId),
          eq(projects.name, name),
          between(dailyData.date, start, end)
        )
      );

    const result = languagesPerDayOfPeriod.reduce(
      (acc, { date, languageSlug, timeSpent }) => {
        if (!acc[date]) {
          acc[date] = {};
        }
        acc[date][languageSlug] = (acc[date][languageSlug] || 0) + timeSpent;
        return acc;
      },
      {} as { [date: string]: { [languageSlug: string]: number } }
    );

    return result;
  }

  async checkProjectExists(checkProjectExitsDto: CheckProjectExistsDtoType) {
    return this.projectsService.checkExists(checkProjectExitsDto);
  }

  async getPeriodProjects(getPeriodProjectsDto: GetPeriodProjectsDtoType) {
    const { userId, start, end } = getPeriodProjectsDto;

    const projectsOnRange = await this.projectsService.findRange({
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

    const [userHasProjectsOfName] = await this.db
      .select({ name: projects.name, path: projects.path })
      .from(projects)
      .innerJoin(dailyData, eq(projects.dailyDataId, dailyData.id))
      .where(and(eq(projects.name, name), eq(dailyData.userId, userId)))
      .limit(1);

    if (!userHasProjectsOfName) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Project Not Found" });
    }

    const [projectAggregatedOnPeriod] = await this.db
      .select({
        name: projects.name,
        path: projects.path,
        totalTimeSpent: sum(projects.timeSpent).mapWith(Number),
      })
      .from(projects)
      .innerJoin(dailyData, eq(projects.dailyDataId, dailyData.id))
      .where(
        and(
          eq(dailyData.userId, userId),
          between(dailyData.date, start, end),
          eq(projects.name, name)
        )
      )
      .groupBy(projects.path, projects.name)
      .orderBy(desc(sum(projects.timeSpent)));

    if (!projectAggregatedOnPeriod) {
      return {
        name: userHasProjectsOfName.name,
        path: userHasProjectsOfName.path,
        totalTimeSpent: 0,
      };
    }

    return projectAggregatedOnPeriod;
  }

  async getProjectPerDayOfPeriod(
    getProjectPerDayOfPeriodDto: GetProjectPerDayOfPeriodDtoType
  ) {
    const { userId, start, end, name, groupBy, periodResolution } =
      getProjectPerDayOfPeriodDto;

    const dailyProjectsForPeriod = await this.findByNameOnRange({
      userId,
      start,
      end,
      name,
    });

    if (dailyProjectsForPeriod.length === 0) {
      return [];
    }

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

    const dailyProjectsForPeriod = await this.findByNameOnRange({
      userId,
      start,
      end,
      name,
    });

    if (dailyProjectsForPeriod.length === 0) {
      return [];
    }

    const totalTimeSpentOnProjectOnPeriod = (
      await this.getProjectOnPeriod({
        userId,
        start,
        end,
        name,
      })
    ).totalTimeSpent;

    const aggregatedLanguageTime = await this.getLanguagesTimeOnPeriod({
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

    const dailyProjectsForPeriod = await this.findByNameOnRange({
      userId,
      start,
      end,
      name,
    });

    if (dailyProjectsForPeriod.length === 0) {
      return [];
    }

    const languagesTimesPerDayOfPeriod =
      await this.getLanguagesTimePerDayOfPeriod({
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
  async getFilesOnPeriod(
    getProjectFilesOnPeriodDto: GetProjectFilesOnPeriodDtoType
  ) {
    const {
      userId,
      name,
      start,
      end,
      amount,
      languages: languagesArray,
    } = getProjectFilesOnPeriodDto;

    const baseQuery = this.db
      .select({
        totalTimeSpent: sum(files.timeSpent).mapWith(Number),
        languageSlug: languages.languageSlug,
        projectName: projects.name,
        name: files.name,
        path: files.path,
      })
      .from(files)
      .innerJoin(projects, eq(projects.id, files.projectId))
      .innerJoin(dailyData, eq(dailyData.id, projects.dailyDataId))
      .innerJoin(languages, eq(languages.id, files.languageId))
      .where(
        and(
          eq(dailyData.userId, userId),
          eq(projects.name, name),
          between(dailyData.date, start, end),
          languagesArray
            ? inArray(languages.languageSlug, languagesArray)
            : undefined
        )
      )
      .groupBy(files.path, languages.languageSlug, projects.name, files.name)
      .orderBy(desc(sum(files.timeSpent).mapWith(Number)));
    const finalQuery = amount ? baseQuery.limit(amount) : baseQuery;
    const result = await finalQuery.execute();

    const resultObject: {
      [filePath: string]: {
        totalTimeSpent: number;
        languageSlug: string;
        name: string;
      };
    } = {};
    for (const entry of result) {
      resultObject[entry.path] = {
        totalTimeSpent: entry.totalTimeSpent,
        languageSlug: entry.languageSlug,
        name: entry.name,
      };
    }

    return resultObject;
  }
}
