import { eachDayOfInterval } from "date-fns";
import { and, between, eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DrizzleAsyncProvider } from "src/drizzle/drizzle.provider";
import { dailyData } from "src/drizzle/schema/dailyData";

import { Inject, Injectable } from "@nestjs/common";
import convertToISODate from "@repo/common/convertToISODate";

import {
  CreateDailyDataDtoType,
  FindOneDailyDataDtoType,
  FindRangeDailyDataDtoType,
  UpdateDailyDataDtoType,
} from "./daily-data.dto";

@Injectable()
export class DailyDataService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: NodePgDatabase
  ) {}
  async create(createDailyDataDto: CreateDailyDataDtoType) {
    const { timeSpent, userId, targetedDate } = createDailyDataDto;

    const [createdDailyData] = await this.db
      .insert(dailyData)
      .values({
        date: targetedDate,
        timeSpent,
        userId,
      })
      .returning({
        timeSpent: dailyData.timeSpent,
        date: dailyData.date,
        id: dailyData.id,
      });

    return createdDailyData;
  }

  async findOne(findOneDailyDataDto: FindOneDailyDataDtoType) {
    const { date, userId } = findOneDailyDataDto;

    const [oneDailyData] = await this.db
      .select({ id: dailyData.id, timeSpent: dailyData.timeSpent })
      .from(dailyData)
      .where(and(eq(dailyData.userId, userId), eq(dailyData.date, date)));

    if (!oneDailyData) return null;

    return oneDailyData;
  }

  async findRange(findRangeDailyDataDto: FindRangeDailyDataDtoType) {
    const { userId, start, end } = findRangeDailyDataDto;

    const dbData = await this.db
      .select({
        id: dailyData.id,
        timeSpent: dailyData.timeSpent,
        date: dailyData.date,
      })
      .from(dailyData)
      .where(
        and(eq(dailyData.userId, userId), between(dailyData.date, start, end))
      );

    const dateRange = eachDayOfInterval({
      start: new Date(start),
      end: new Date(end),
    });

    const dataByDate = Object.fromEntries(
      dbData.map((item) => [item.date, item])
    );

    const range = dateRange.map((date) => {
      const formattedDate = convertToISODate(date);
      return (
        dataByDate[formattedDate] || {
          id: null,
          timeSpent: 0,
          date: formattedDate,
        }
      );
    });

    return range;
  }

  async update(updateDailyDataDto: UpdateDailyDataDtoType) {
    const { timeSpent, userId, targetedDate } = updateDailyDataDto;

    const [updatedDailyData] = await this.db
      .update(dailyData)
      .set({
        date: targetedDate,
        timeSpent,
      })
      .where(
        and(eq(dailyData.userId, userId), eq(dailyData.date, targetedDate))
      )
      .returning({
        timeSpent: dailyData.timeSpent,
        id: dailyData.id,
        date: dailyData.date,
      });
    return updatedDailyData;
  }
}
