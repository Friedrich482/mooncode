import { differenceInDays, eachDayOfInterval } from "date-fns";
import {
  and,
  between,
  count,
  desc,
  eq,
  ilike,
  inArray,
  sum,
} from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import {
  CheckProjectExistsDtoType,
  FindProjectByNameOnRangeDtoType,
  GetPeriodGeneralStatsForProjectDtoType,
  GetPeriodProjectsDtoType,
  GetProjectDailyStatsDtoType,
  GetProjectFilesOnPeriodDtoType,
  GetProjectLanguagesPerDayOfPeriodDtoType,
  GetProjectLanguagesTimeOnPeriodDtoType,
  GetProjectLanguagesTimeOnPeriodType,
  GetProjectLanguagesTimePerDayOfPeriodDtoType,
  GetProjectOnPeriodDtoType,
  GetProjectPerDayOfPeriodDtoType,
} from "src/analytics/dto/projects-analytics.dto";
import { getProjectLanguagesGroupedByMonths } from "src/analytics/utils/projects/get-project-languages-grouped-by-months";
import { getProjectLanguagesGroupedByWeeks } from "src/analytics/utils/projects/get-project-languages-grouped-by-weeks";
import { getProjectPerDayOfPeriodGroupedByMonths } from "src/analytics/utils/projects/get-project-per-day-of-period-grouped-by-months";
import { getProjectPerDayOfPeriodGroupedByWeeks } from "src/analytics/utils/projects/get-project-per-day-of-period-grouped-by-weeks";
import { getWeekDayName } from "src/common/utils/get-weekday-name";
import { DailyDataService } from "src/daily-data/daily-data.service";
import { DrizzleAsyncProvider } from "src/drizzle/drizzle.provider";
import { dailyData, files, languages, projects } from "src/drizzle/schema";
import { ProjectsService } from "src/projects/projects.service";

import { Inject, Injectable } from "@nestjs/common";
import { convertToISODate } from "@repo/common/convert-to-iso-date";
import { formatDuration } from "@repo/common/format-duration";
import { TRPCError } from "@trpc/server";

import { NUMBER_OF_FILES_PER_PAGE } from "../constants";
import { NAString } from "../dto/common";
import { getProjectGeneralStatsOnPeriodGroupedByMonths } from "../utils/projects/get-project-general-stats-on-period-grouped-by-months";
import { getProjectGeneralStatsOnPeriodGroupedByWeeks } from "../utils/projects/get-project-general-stats-on-period-grouped-by-weeks";
import { getProjectMostUsedLanguageOnPeriod } from "../utils/projects/get-project-most-used-language-on-period";

@Injectable()
export class ProjectsAnalyticsService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase,
    private readonly projectsService: ProjectsService,
    private readonly dailyDataService: DailyDataService,
  ) {}

  async findProjectByNameOnRange(
    findProjectByNameOnRangeDto: FindProjectByNameOnRangeDtoType,
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
          between(dailyData.date, start, end),
        ),
      )
      .groupBy(dailyData.date);

    const dateRange = eachDayOfInterval({
      start: new Date(start),
      end: new Date(end),
    });

    const dataByDate = Object.fromEntries(
      data.map((item) => [item.date, item]),
    );

    const projectOnDaysOnPeriod = dateRange.map((date) => {
      const formattedDate = convertToISODate(date);
      return (
        dataByDate[formattedDate] || {
          timeSpent: 0,
          date: formattedDate,
        }
      );
    });

    return projectOnDaysOnPeriod;
  }

  async getLanguagesTimeOnPeriod(
    getProjectLanguagesTimeOnPeriodDto: GetProjectLanguagesTimeOnPeriodDtoType,
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
          between(dailyData.date, start, end),
        ),
      )
      .groupBy(languages.languageSlug)
      .orderBy(desc(sum(files.timeSpent).mapWith(Number)));

    const languagesTimesOnPeriod: { [languageSlug: string]: number } =
      Object.fromEntries(
        aggregated.map(({ languageSlug, totalTime }) => [
          languageSlug,
          totalTime,
        ]),
      );

    return languagesTimesOnPeriod;
  }

  async getLanguagesTimePerDayOfPeriod(
    getProjectLanguagesTimePerDayOfPeriodDto: GetProjectLanguagesTimePerDayOfPeriodDtoType,
  ) {
    const { userId, name, start, end } =
      getProjectLanguagesTimePerDayOfPeriodDto;

    const data = await this.db
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
          between(dailyData.date, start, end),
        ),
      );

    const languagesPerDayOfPeriod = data.reduce(
      (acc, { date, languageSlug, timeSpent }) => {
        if (!acc[date]) {
          acc[date] = {};
        }
        acc[date][languageSlug] = (acc[date][languageSlug] || 0) + timeSpent;
        return acc;
      },
      {} as { [date: string]: { [languageSlug: string]: number } },
    );

    return languagesPerDayOfPeriod;
  }

  async checkProjectExists(checkProjectExitsDto: CheckProjectExistsDtoType) {
    return this.projectsService.checkExists(checkProjectExitsDto);
  }

  async getPeriodProjects(getPeriodProjectsDto: GetPeriodProjectsDtoType) {
    const { userId, start, end, page } = getPeriodProjectsDto;

    const { timeSpentPerProject: projectsOnRange, hasNext } =
      await this.projectsService.findRange({
        userId,
        start,
        end,
        page,
      });

    const timeSpentAcrossAllProjects = projectsOnRange.reduce(
      (acc, value) => acc + value.totalTimeSpent,
      0,
    );

    const periodProjects = projectsOnRange.map((project) => ({
      ...project,
      percentage:
        timeSpentAcrossAllProjects === 0
          ? 0
          : parseFloat(
              (
                (project.totalTimeSpent * 100) /
                timeSpentAcrossAllProjects
              ).toFixed(2),
            ),
    }));

    return { periodProjects, hasNext };
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
          eq(projects.name, name),
        ),
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
    getProjectPerDayOfPeriodDto: GetProjectPerDayOfPeriodDtoType,
  ) {
    const { userId, start, end, name, groupBy, periodResolution } =
      getProjectPerDayOfPeriodDto;

    const projectOnDaysOnPeriod = await this.findProjectByNameOnRange({
      userId,
      start,
      end,
      name,
    });

    if (projectOnDaysOnPeriod.length === 0) {
      return [];
    }

    switch (groupBy) {
      case "weeks":
        return getProjectPerDayOfPeriodGroupedByWeeks(
          projectOnDaysOnPeriod,
          periodResolution,
        );

      case "months":
        return getProjectPerDayOfPeriodGroupedByMonths(projectOnDaysOnPeriod);

      default:
        break;
    }

    const projectsPerDayOfPeriod = projectOnDaysOnPeriod.map(
      ({ timeSpent, date }) => ({
        timeSpentLine: timeSpent,
        timeSpentBar: timeSpent,
        timeSpentArea: timeSpent,
        value: formatDuration(timeSpent),
        originalDate: new Date(date).toDateString(),
        date: getWeekDayName(date),
      }),
    );

    return projectsPerDayOfPeriod;
  }

  async getProjectLanguagesTimeOnPeriod(
    getProjectLanguagesTimeOnPeriod: GetProjectLanguagesTimeOnPeriodType,
  ) {
    const { userId, start, end, name } = getProjectLanguagesTimeOnPeriod;

    const projectOnDaysOnPeriod = await this.findProjectByNameOnRange({
      userId,
      start,
      end,
      name,
    });

    if (projectOnDaysOnPeriod.length === 0) {
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

    const projectLanguagesTimeOnPeriod = Object.entries(aggregatedLanguageTime)
      .map(([languageSlug, timeSpent]) => ({
        languageSlug,
        time: timeSpent,
        value: formatDuration(timeSpent),
        percentage:
          totalTimeSpentOnProjectOnPeriod === 0
            ? 0
            : parseFloat(
                ((timeSpent * 100) / totalTimeSpentOnProjectOnPeriod).toFixed(
                  2,
                ),
              ),
      }))
      .sort((a, b) => a.time - b.time);

    return projectLanguagesTimeOnPeriod;
  }

  async getProjectLanguagesPerDayOfPeriod(
    getProjectLanguagesPerDayOfPeriodDto: GetProjectLanguagesPerDayOfPeriodDtoType,
  ) {
    const { userId, start, end, name, groupBy, periodResolution } =
      getProjectLanguagesPerDayOfPeriodDto;

    const projectOnDaysOnPeriod = await this.findProjectByNameOnRange({
      userId,
      start,
      end,
      name,
    });

    if (projectOnDaysOnPeriod.length === 0) {
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
        return getProjectLanguagesGroupedByWeeks(
          projectOnDaysOnPeriod,
          periodResolution,
          languagesTimesPerDayOfPeriod,
        );

      case "months":
        return getProjectLanguagesGroupedByMonths(
          projectOnDaysOnPeriod,
          languagesTimesPerDayOfPeriod,
        );

      default:
        break;
    }

    const periodLanguagesPerDayOfPeriod = projectOnDaysOnPeriod.map(
      ({ timeSpent, date }) => ({
        timeSpent,
        originalDate: new Date(date).toDateString(),
        date: getWeekDayName(date),
        ...(languagesTimesPerDayOfPeriod[date] ?? {}),
      }),
    );

    return periodLanguagesPerDayOfPeriod;
  }

  async getProjectDailyStats(
    getProjectDailyStatsDto: GetProjectDailyStatsDtoType,
  ) {
    const { dateString, name, userId } = getProjectDailyStatsDto;

    const dayData = await this.dailyDataService.findOne({
      userId,
      date: dateString,
    });

    if (!dayData || dayData.timeSpent === 0) {
      return {
        formattedTotalTimeSpent: formatDuration(0),
        finalData: [],
      };
    }

    const rawProjectFilesOnDay = await this.db
      .select({
        timeSpent: files.timeSpent,
        languageSlug: languages.languageSlug,
        projectPath: projects.path,
      })
      .from(files)
      .innerJoin(projects, eq(projects.id, files.projectId))
      .innerJoin(languages, eq(languages.id, files.languageId))
      .where(
        and(eq(projects.name, name), eq(projects.dailyDataId, dayData.id)),
      );

    if (rawProjectFilesOnDay.length === 0) {
      return {
        formattedTotalTimeSpent: formatDuration(0),
        finalData: [],
      };
    }

    const projectLanguagesOnDay = rawProjectFilesOnDay.reduce(
      (acc, current) => {
        acc[current.languageSlug] =
          (acc[current.languageSlug] || 0) + current.timeSpent;
        return acc;
      },
      {} as { [languageSlug: string]: number },
    );

    const totalTimeSpent = (
      await this.projectsService.findOne({
        dailyDataId: dayData.id,
        name: name,
        path: rawProjectFilesOnDay[0].projectPath,
      })
    )?.timeSpent;

    if (!totalTimeSpent) {
      return {
        formattedTotalTimeSpent: formatDuration(0),
        finalData: [],
      };
    }

    const finalData = Object.entries(projectLanguagesOnDay)
      .map(([languageSlug, timeSpent]) => ({
        languageSlug,
        timeSpent,
        formattedValue: formatDuration(timeSpent),
        percentage: parseFloat(((timeSpent * 100) / totalTimeSpent).toFixed(2)),
      }))
      .sort((a, b) => b.timeSpent - a.timeSpent);

    const formattedTotalTimeSpent = formatDuration(totalTimeSpent);

    return { finalData, formattedTotalTimeSpent };
  }

  async getPeriodGeneralStatsForProject(
    getPeriodGeneralStatsForProjectDto: GetPeriodGeneralStatsForProjectDtoType,
  ) {
    const {
      userId,
      name,
      start,
      end,
      todaysDateString,
      groupBy,
      periodResolution,
    } = getPeriodGeneralStatsForProjectDto;

    const projectPerDayOfPeriod = await this.findProjectByNameOnRange({
      name,
      start,
      end,
      userId,
    });

    if (projectPerDayOfPeriod.length === 0)
      return {
        avgTime: formatDuration(0),
        percentageToAvg: 0,
        mostActiveDate: "N/A",
        mostUsedLanguageSlug: "N/A",
      };

    switch (groupBy) {
      case "weeks":
        return getProjectGeneralStatsOnPeriodGroupedByWeeks(
          userId,
          start,
          end,
          todaysDateString,
          name,
          this,
          projectPerDayOfPeriod,
          periodResolution,
        );

      case "months":
        return getProjectGeneralStatsOnPeriodGroupedByMonths(
          userId,
          start,
          end,
          todaysDateString,
          name,
          this,
          projectPerDayOfPeriod,
        );

      default:
        break;
    }

    const numberOfDays = differenceInDays(end, start) + 1;
    const { totalTimeSpent: totalTimeSpentOnPeriod, path } =
      await this.getProjectOnPeriod({ userId, start, end, name });

    const mean = Math.floor(totalTimeSpentOnPeriod / numberOfDays);

    const todaysDailyDataId = (
      await this.dailyDataService.findOne({ date: todaysDateString, userId })
    )?.id;

    let timeSpentOnProjectToday = 0;
    if (todaysDailyDataId) {
      timeSpentOnProjectToday =
        (
          await this.projectsService.findOne({
            dailyDataId: todaysDailyDataId || "",
            name,
            path,
          })
        )?.timeSpent || 0;
    }

    const percentageToAvg =
      mean === 0
        ? 0
        : parseFloat(
            (((timeSpentOnProjectToday - mean) / mean) * 100).toFixed(2),
          );

    const maxTimeSpentPerDay =
      projectPerDayOfPeriod.length > 0
        ? Math.max(...projectPerDayOfPeriod.map((day) => day.timeSpent))
        : 0;

    const mostActiveDate: NAString =
      maxTimeSpentPerDay === 0
        ? "N/A"
        : new Date(
            projectPerDayOfPeriod.find(
              (day) => day.timeSpent === maxTimeSpentPerDay,
            )?.date || convertToISODate(new Date(start)),
          ).toDateString();

    const mostUsedLanguageSlug = await getProjectMostUsedLanguageOnPeriod(
      this,
      name,
      userId,
      start,
      end,
    );

    return {
      avgTime: formatDuration(mean),
      percentageToAvg,
      mostActiveDate,
      mostUsedLanguageSlug,
    };
  }

  async getFilesOnPeriod<T extends GetProjectFilesOnPeriodDtoType>(
    getProjectFilesOnPeriodDto: T,
  ): Promise<
    T extends {
      type: "paginated";
    }
      ? {
          projectFilesOnPeriod: {
            [filePath: string]: {
              totalTimeSpent: number;
              languageSlug: string;
              name: string;
            };
          };
          hasNext: boolean;
        }
      : T extends { type: "normal" }
        ? {
            [filePath: string]: {
              totalTimeSpent: number;
              languageSlug: string;
              name: string;
            };
          }
        : never
  > {
    const { userId, name, start, end, type } = getProjectFilesOnPeriodDto;

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
      .innerJoin(languages, eq(languages.id, files.languageId));

    // normal case
    if (type === "normal") {
      const { amount } = getProjectFilesOnPeriodDto;

      const result = await baseQuery
        .where(
          and(
            eq(dailyData.userId, userId),
            eq(projects.name, name),
            between(dailyData.date, start, end),
          ),
        )
        .groupBy(files.path, languages.languageSlug, projects.name, files.name)
        .orderBy(desc(sum(files.timeSpent).mapWith(Number)))
        .limit(amount)
        .execute();

      const projectFilesOnPeriod: {
        [filePath: string]: {
          totalTimeSpent: number;
          languageSlug: string;
          name: string;
        };
      } = Object.fromEntries(
        result.map((entry) => [
          entry.path,
          {
            totalTimeSpent: entry.totalTimeSpent,
            languageSlug: entry.languageSlug,
            name: entry.name,
          },
        ]),
      );

      return projectFilesOnPeriod as Awaited<
        ReturnType<typeof this.getFilesOnPeriod<T>>
      >;
    }

    // paginated case
    const {
      languages: languagesArray,
      page,
      search,
    } = getProjectFilesOnPeriodDto;

    const result = await baseQuery
      .where(
        and(
          eq(dailyData.userId, userId),
          eq(projects.name, name),
          between(dailyData.date, start, end),
          search ? ilike(files.name, `%${search}%`) : undefined,
          languagesArray
            ? inArray(languages.languageSlug, languagesArray)
            : undefined,
        ),
      )
      .groupBy(files.path, languages.languageSlug, projects.name, files.name)
      .orderBy(desc(sum(files.timeSpent).mapWith(Number)))
      .offset((page - 1) * NUMBER_OF_FILES_PER_PAGE)
      .limit(NUMBER_OF_FILES_PER_PAGE)
      .execute();

    const projectFilesOnPeriod: {
      [filePath: string]: {
        totalTimeSpent: number;
        languageSlug: string;
        name: string;
      };
    } = Object.fromEntries(
      result.map((entry) => [
        entry.path,
        {
          totalTimeSpent: entry.totalTimeSpent,
          languageSlug: entry.languageSlug,
          name: entry.name,
        },
      ]),
    );

    const [{ count: total }] = await this.db.select({ count: count() }).from(
      this.db
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
            search ? ilike(files.name, `%${search}%`) : undefined,
            languagesArray
              ? inArray(languages.languageSlug, languagesArray)
              : undefined,
          ),
        )
        .groupBy(files.path, languages.languageSlug, projects.name, files.name)
        .as("grouped_files"),
    );

    const hasNext = page * NUMBER_OF_FILES_PER_PAGE < total;

    return { projectFilesOnPeriod, hasNext } as Awaited<
      ReturnType<typeof this.getFilesOnPeriod<T>>
    >;
  }
}
