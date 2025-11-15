import { eachDayOfInterval } from "date-fns";
import { and, between, desc, eq, inArray, sum } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DrizzleAsyncProvider } from "src/drizzle/drizzle.provider";
import { dailyData } from "src/drizzle/schema/dailyData";
import { files } from "src/drizzle/schema/files";
import { languages } from "src/drizzle/schema/languages";
import { projects } from "src/drizzle/schema/projects";

import { Inject, Injectable } from "@nestjs/common";
import convertToISODate from "@repo/common/convertToISODate";
import { TRPCError } from "@trpc/server";

import {
  FindProjectByNameOnRangeDtoType,
  GetAllProjectFilesOnPeriodDtoType,
  GetProjectLanguagesTimeOnPeriodDtoType,
  GetProjectLanguagesTimePerDayOfPeriodDtoType,
  GroupAndAggregateProjectByNameDtoType,
} from "./projects.dto";

@Injectable()
export class ProjectsAnalyticsService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase
  ) {}

  async groupAndAggregateProjectByName(
    groupAndAggregateProjectByNameDto: GroupAndAggregateProjectByNameDtoType
  ) {
    const { userId, name, start, end } = groupAndAggregateProjectByNameDto;

    const [userHasProjectsOfName] = await this.db
      .select({ name: projects.name, path: projects.path })
      .from(projects)
      .innerJoin(dailyData, eq(projects.dailyDataId, dailyData.id))
      .where(and(eq(projects.name, name), eq(dailyData.userId, userId)))
      .limit(1);

    if (!userHasProjectsOfName)
      throw new TRPCError({ code: "NOT_FOUND", message: "Project Not Found" });

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

    if (!projectAggregatedOnPeriod)
      return {
        name: userHasProjectsOfName.name,
        path: userHasProjectsOfName.path,
        totalTimeSpent: 0,
      };

    return projectAggregatedOnPeriod;
  }

  async findProjectByNameOnRange(
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

    return dateRange.map((date) => {
      const formattedDate = convertToISODate(date);
      return (
        dataByDate[formattedDate] || {
          timeSpent: 0,
          date: formattedDate,
        }
      );
    });
  }

  async getProjectLanguagesTimeOnPeriod(
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

  async getProjectLanguagesTimePerDayOfPeriod(
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

  async getAllProjectFilesOnPeriod(
    getAllProjectFilesOnPeriodDto: GetAllProjectFilesOnPeriodDtoType
  ) {
    const {
      userId,
      name,
      start,
      end,
      amount,
      languages: languagesArray,
    } = getAllProjectFilesOnPeriodDto;

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
