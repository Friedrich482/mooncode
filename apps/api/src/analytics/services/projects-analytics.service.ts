import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  and,
  asc,
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
  GetProjectBranchesOnPeriodDtoType,
  GetProjectDailyStatsDtoType,
  GetProjectFilesOnPeriodDtoType,
  GetProjectLanguagesPerDayOfPeriodDtoType,
  GetProjectLanguagesTimeOnPeriodDtoType,
  GetProjectLanguagesTimeOnPeriodType,
  GetProjectLanguagesTimePerDayOfPeriodDtoType,
  GetProjectOnPeriodDtoType,
  GetProjectPerDayOfPeriodDtoType,
} from "@/analytics/dto/projects-analytics.dto";
import { getProjectGeneralStatsOnPeriodGroupedByDays } from "@/analytics/utils/projects/get-project-general-stats-on-period-grouped-by-days";
import { getProjectGeneralStatsOnPeriodGroupedByMonths } from "@/analytics/utils/projects/get-project-general-stats-on-period-grouped-by-months";
import { getProjectGeneralStatsOnPeriodGroupedByWeeks } from "@/analytics/utils/projects/get-project-general-stats-on-period-grouped-by-weeks";
import { getProjectLanguagesGroupedByDays } from "@/analytics/utils/projects/get-project-languages-grouped-by-days";
import { getProjectLanguagesGroupedByMonths } from "@/analytics/utils/projects/get-project-languages-grouped-by-months";
import { getProjectLanguagesGroupedByWeeks } from "@/analytics/utils/projects/get-project-languages-grouped-by-weeks";
import { getProjectMostUsedLanguageOnPeriod } from "@/analytics/utils/projects/get-project-most-used-language-on-period";
import { getProjectPerDayOfPeriodGroupedByDays } from "@/analytics/utils/projects/get-project-per-day-of-period-grouped-by-days";
import { getProjectPerDayOfPeriodGroupedByMonths } from "@/analytics/utils/projects/get-project-per-day-of-period-grouped-by-months";
import { getProjectPerDayOfPeriodGroupedByWeeks } from "@/analytics/utils/projects/get-project-per-day-of-period-grouped-by-weeks";
import { BranchesService } from "@/branches/branches.service";
import { DailyDataService } from "@/daily-data/daily-data.service";
import { DRIZZLE_ASYNC_PROVIDER } from "@/drizzle/constants";
import {
  branches,
  dailyData,
  files,
  languages,
  projects,
} from "@/drizzle/schema";
import { ProjectsService } from "@/projects/projects.service";
import { Inject, Injectable } from "@nestjs/common";
import { convertToISODate } from "@repo/common/convert-to-iso-date";
import { formatDuration } from "@repo/common/format-duration";
import { TRPCError } from "@trpc/server";

import { NUMBER_OF_FILES_PER_PAGE } from "../constants";

@Injectable()
export class ProjectsAnalyticsService {
  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER)
    private readonly db: NodePgDatabase,
    private readonly projectsService: ProjectsService,
    private readonly branchesService: BranchesService,
    private readonly dailyDataService: DailyDataService,
  ) {}

  async findProjectByNameOnRange(
    findProjectByNameOnRangeDto: FindProjectByNameOnRangeDtoType,
  ) {
    const {
      userId,
      name,
      branches: branchesArray,
      start,
      end,
    } = findProjectByNameOnRangeDto;

    const data = await this.db
      .select({
        date: dailyData.date,
        timeSpent: sum(branches.timeSpent).mapWith(Number),
      })
      .from(projects)
      .innerJoin(branches, eq(projects.id, branches.projectId))
      .innerJoin(dailyData, eq(dailyData.id, projects.dailyDataId))
      .where(
        and(
          eq(dailyData.userId, userId),
          eq(projects.name, name),
          branchesArray ? inArray(branches.name, branchesArray) : undefined,
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
        dataByDate[formattedDate] ?? {
          date: formattedDate,
          timeSpent: 0,
        }
      );
    });

    return projectOnDaysOnPeriod;
  }

  async getLanguagesTimeOnPeriod(
    getProjectLanguagesTimeOnPeriodDto: GetProjectLanguagesTimeOnPeriodDtoType,
  ) {
    const {
      userId,
      name,
      branches: branchesArray,
      start,
      end,
    } = getProjectLanguagesTimeOnPeriodDto;

    const aggregated = await this.db
      .select({
        languageSlug: languages.languageSlug,
        totalTime: sum(files.timeSpent).mapWith(Number),
      })
      .from(files)
      .innerJoin(branches, eq(branches.id, files.branchId))
      .innerJoin(projects, eq(projects.id, branches.projectId))
      .innerJoin(dailyData, eq(dailyData.id, projects.dailyDataId))
      .innerJoin(languages, eq(languages.id, files.languageId))
      .where(
        and(
          eq(dailyData.userId, userId),
          eq(projects.name, name),
          branchesArray ? inArray(branches.name, branchesArray) : undefined,
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
    const {
      userId,
      name,
      branches: branchesArray,
      start,
      end,
    } = getProjectLanguagesTimePerDayOfPeriodDto;

    const data = await this.db
      .select({
        languageSlug: languages.languageSlug,
        timeSpent: files.timeSpent,
        date: dailyData.date,
      })
      .from(files)
      .innerJoin(branches, eq(branches.id, files.branchId))
      .innerJoin(projects, eq(projects.id, branches.projectId))
      .innerJoin(dailyData, eq(dailyData.id, projects.dailyDataId))
      .innerJoin(languages, eq(languages.id, files.languageId))
      .where(
        and(
          eq(dailyData.userId, userId),
          eq(projects.name, name),
          branchesArray ? inArray(branches.name, branchesArray) : undefined,
          between(dailyData.date, start, end),
        ),
      );

    const languagesPerDayOfPeriod = data.reduce(
      (acc, { date, languageSlug, timeSpent }) => {
        acc[date] ??= {};
        acc[date][languageSlug] = (acc[date][languageSlug] ?? 0) + timeSpent;
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
    const {
      userId,
      start,
      end,
      name,
      branches: branchesArray,
    } = getProjectOnPeriodDto;

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
        totalTimeSpent: sum(branches.timeSpent).mapWith(Number),
      })
      .from(projects)
      .innerJoin(dailyData, eq(dailyData.id, projects.dailyDataId))
      .innerJoin(branches, eq(projects.id, branches.projectId))
      .where(
        and(
          eq(dailyData.userId, userId),
          eq(projects.name, name),
          branchesArray ? inArray(branches.name, branchesArray) : undefined,
          between(dailyData.date, start, end),
        ),
      )
      .groupBy(projects.path, projects.name)
      .orderBy(desc(sum(branches.timeSpent)));

    if (!projectAggregatedOnPeriod) {
      return {
        name: userHasProjectsOfName.name,
        path: userHasProjectsOfName.path,
        totalTimeSpent: 0,
      };
    }

    return projectAggregatedOnPeriod;
  }

  async getProjectBranchesOnPeriod(
    getProjectBranchesOnPeriodDto: GetProjectBranchesOnPeriodDtoType,
  ) {
    const { userId, start, end, name } = getProjectBranchesOnPeriodDto;

    const projectBranches = await this.db
      .select({
        name: branches.name,
        timeSpent: sum(branches.timeSpent).mapWith(Number),
      })
      .from(branches)
      .innerJoin(projects, eq(projects.id, branches.projectId))
      .innerJoin(dailyData, eq(dailyData.id, projects.dailyDataId))
      .where(
        and(
          eq(dailyData.userId, userId),
          eq(projects.name, name),
          between(dailyData.date, start, end),
        ),
      )
      .groupBy(branches.name)
      .orderBy(asc(sum(branches.timeSpent)));

    return projectBranches;
  }

  async getProjectPerDayOfPeriod(
    getProjectPerDayOfPeriodDto: GetProjectPerDayOfPeriodDtoType,
  ) {
    const { userId, start, end, name, branches, groupBy, periodResolution } =
      getProjectPerDayOfPeriodDto;

    const projectOnDaysOnPeriod = await this.findProjectByNameOnRange({
      userId,
      start,
      end,
      name,
      branches,
    });

    if (projectOnDaysOnPeriod.length === 0) {
      return [];
    }

    switch (groupBy) {
      case "days":
        return getProjectPerDayOfPeriodGroupedByDays(projectOnDaysOnPeriod);

      case "weeks":
        return getProjectPerDayOfPeriodGroupedByWeeks(
          projectOnDaysOnPeriod,
          periodResolution,
        );

      case "months":
        return getProjectPerDayOfPeriodGroupedByMonths(projectOnDaysOnPeriod);

      case undefined:
        return getProjectPerDayOfPeriodGroupedByDays(projectOnDaysOnPeriod);

      default:
        throw groupBy satisfies never;
    }
  }

  async getProjectLanguagesTimeOnPeriod(
    getProjectLanguagesTimeOnPeriod: GetProjectLanguagesTimeOnPeriodType,
  ) {
    const { userId, start, end, name, branches } =
      getProjectLanguagesTimeOnPeriod;

    const projectOnDaysOnPeriod = await this.findProjectByNameOnRange({
      userId,
      start,
      end,
      name,
      branches,
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
        branches,
      })
    ).totalTimeSpent;

    const aggregatedLanguageTime = await this.getLanguagesTimeOnPeriod({
      userId,
      start,
      end,
      name,
      branches,
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
    const { userId, start, end, name, branches, groupBy, periodResolution } =
      getProjectLanguagesPerDayOfPeriodDto;

    const projectOnDaysOnPeriod = await this.findProjectByNameOnRange({
      userId,
      start,
      end,
      name,
      branches,
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
      case "days":
        return getProjectLanguagesGroupedByDays(
          projectOnDaysOnPeriod,
          languagesTimesPerDayOfPeriod,
        );

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

      case undefined:
        return getProjectLanguagesGroupedByDays(
          projectOnDaysOnPeriod,
          languagesTimesPerDayOfPeriod,
        );

      default:
        throw groupBy satisfies never;
    }
  }

  async getProjectDailyStats(
    getProjectDailyStatsDto: GetProjectDailyStatsDtoType,
  ) {
    const {
      dateString,
      name,
      branches: branchesArray,
      userId,
    } = getProjectDailyStatsDto;

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
      .innerJoin(branches, eq(branches.id, files.branchId))
      .innerJoin(projects, eq(projects.id, branches.projectId))
      .innerJoin(languages, eq(languages.id, files.languageId))
      .where(
        and(
          eq(projects.name, name),
          branchesArray ? inArray(branches.name, branchesArray) : undefined,
          eq(projects.dailyDataId, dayData.id),
        ),
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
          (acc[current.languageSlug] ?? 0) + current.timeSpent;
        return acc;
      },
      {} as { [languageSlug: string]: number },
    );

    const projectId = (
      await this.projectsService.findOne({
        dailyDataId: dayData.id,
        name,
        path: rawProjectFilesOnDay[0].projectPath,
      })
    )?.id;

    if (!projectId) {
      return {
        formattedTotalTimeSpent: formatDuration(0),
        finalData: [],
      };
    }

    let totalTimeSpent = 0;

    // if there are branches, the total time spent is the sum of the times spent across all the branches
    if (branchesArray) {
      const branchesFound = await Promise.all(
        branchesArray.map(
          async (branch) =>
            await this.branchesService.findOne({
              projectId,
              name: branch,
            }),
        ),
      );

      totalTimeSpent = branchesFound.reduce((acc, curr) => {
        acc = acc + (curr?.timeSpent ?? 0);
        return acc;
      }, 0);
    } else {
      // otherwise it is just the time spent on the project
      totalTimeSpent =
        (
          await this.projectsService.findOne({
            dailyDataId: dayData.id,
            name,
            path: rawProjectFilesOnDay[0].projectPath,
          })
        )?.timeSpent ?? 0;
    }

    if (totalTimeSpent === 0) {
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
      branches,
      start,
      end,
      todaysDateString,
      groupBy,
      periodResolution,
    } = getPeriodGeneralStatsForProjectDto;

    const projectPerDayOfPeriod = await this.findProjectByNameOnRange({
      name,
      branches,
      start,
      end,
      userId,
    });

    if (projectPerDayOfPeriod.length === 0) {
      return {
        avgTime: formatDuration(0),
        percentageToAvg: 0,
        mostActiveDate: "N/A",
        mostUsedLanguageSlug: "N/A",
      };
    }

    const { totalTimeSpent: totalTimeSpentOnPeriod, path } =
      await this.getProjectOnPeriod({
        userId,
        start,
        end,
        name,
        branches,
      });

    const projectLanguagesTimeOnPeriod = await this.getLanguagesTimeOnPeriod({
      name,
      branches,
      start,
      end,
      userId,
    });

    const mostUsedLanguageSlug = getProjectMostUsedLanguageOnPeriod(
      projectLanguagesTimeOnPeriod,
    );

    const todaysDailyDataId = (
      await this.dailyDataService.findOne({ date: todaysDateString, userId })
    )?.id;

    let timeSpentOnProjectToday = 0;

    if (todaysDailyDataId) {
      const projectId = (
        await this.projectsService.findOne({
          dailyDataId: todaysDailyDataId,
          name,
          path,
        })
      )?.id;

      // if there are branches the total time spent is the sum of the times spent across all the branches
      if (branches && projectId) {
        const branchesFound = await Promise.all(
          branches.map(
            async (branch) =>
              await this.branchesService.findOne({
                projectId,
                name: branch,
              }),
          ),
        );

        timeSpentOnProjectToday = branchesFound.reduce((acc, curr) => {
          acc = acc + (curr?.timeSpent ?? 0);
          return acc;
        }, 0);
      } else if (projectId) {
        // otherwise it is just the time spent in the project
        timeSpentOnProjectToday =
          (
            await this.projectsService.findOne({
              dailyDataId: todaysDailyDataId,
              name,
              path,
            })
          )?.timeSpent ?? 0;
      }
    }

    switch (groupBy) {
      case "days":
        return {
          ...getProjectGeneralStatsOnPeriodGroupedByDays({
            start,
            end,
            totalTimeSpentOnPeriod,
            timeSpentOnProjectToday,
            projectPerDayOfPeriod,
          }),
          mostUsedLanguageSlug,
        };

      case "weeks":
        const timeSpentOnProjectTodaysWeek = (
          await this.getProjectOnPeriod({
            userId,
            name,
            start: convertToISODate(startOfWeek(new Date(todaysDateString))),
            end: convertToISODate(endOfWeek(new Date(todaysDateString))),
          })
        ).totalTimeSpent;

        return {
          ...getProjectGeneralStatsOnPeriodGroupedByWeeks({
            start,
            end,
            totalTimeSpentOnPeriod,
            timeSpentOnProjectTodaysWeek,
            projectPerDayOfPeriod,
            periodResolution,
          }),
          mostUsedLanguageSlug,
        };

      case "months":
        const timeSpentOnProjectTodaysMonth = (
          await this.getProjectOnPeriod({
            userId,
            name,
            start: convertToISODate(startOfMonth(new Date(todaysDateString))),
            end: convertToISODate(endOfMonth(new Date(todaysDateString))),
          })
        ).totalTimeSpent;

        return {
          ...getProjectGeneralStatsOnPeriodGroupedByMonths({
            start,
            end,
            totalTimeSpentOnPeriod,
            timeSpentOnProjectTodaysMonth,
            projectPerDayOfPeriod,
          }),
          mostUsedLanguageSlug,
        };

      case undefined:
        return {
          ...getProjectGeneralStatsOnPeriodGroupedByDays({
            start,
            end,
            totalTimeSpentOnPeriod,
            timeSpentOnProjectToday,
            projectPerDayOfPeriod,
          }),
          mostUsedLanguageSlug,
        };

      default:
        throw groupBy satisfies never;
    }
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
    const {
      userId,
      name,
      branches: branchesArray,
      start,
      end,
      type,
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
      .innerJoin(branches, eq(branches.id, files.branchId))
      .innerJoin(projects, eq(projects.id, branches.projectId))
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
            branchesArray ? inArray(branches.name, branchesArray) : undefined,
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
          branchesArray ? inArray(branches.name, branchesArray) : undefined,
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
        .innerJoin(branches, eq(branches.id, files.branchId))
        .innerJoin(projects, eq(projects.id, branches.projectId))
        .innerJoin(dailyData, eq(dailyData.id, projects.dailyDataId))
        .innerJoin(languages, eq(languages.id, files.languageId))
        .where(
          and(
            eq(dailyData.userId, userId),
            eq(projects.name, name),
            branchesArray ? inArray(branches.name, branchesArray) : undefined,
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
