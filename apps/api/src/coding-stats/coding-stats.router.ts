import { TrpcService } from "src/trpc/trpc.service";

import { Injectable } from "@nestjs/common";

import {
  GetDailyStatsForChartDto,
  GetDailyStatsForExtensionDto,
  GetDaysOfPeriodStatsDto,
  GetPeriodGeneralStatsDto,
  GetPeriodLanguagesPerDayDto,
  GetPeriodLanguagesTimeDto,
  GetTimeSpentOnPeriodDto,
  UpsertLanguagesDto,
} from "./coding-stats.dto";
import { CodingStatsService } from "./coding-stats.service";

@Injectable()
export class CodingStatsRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly codingStatsService: CodingStatsService,
  ) {}
  procedures = {
    codingStats: this.trpcService.trpc.router({
      upsert: this.trpcService
        .protectedProcedure()
        .input(UpsertLanguagesDto)
        .mutation(async ({ ctx, input }) =>
          this.codingStatsService.upsert({
            userId: ctx.user.sub,
            ...input,
          }),
        ),

      getDailyStatsForExtension: this.trpcService
        .protectedProcedure()
        .input(GetDailyStatsForExtensionDto)
        .query(async ({ ctx, input }) =>
          this.codingStatsService.getDailyStatsForExtension({
            userId: ctx.user.sub,
            ...input,
          }),
        ),

      getTimeSpentOnPeriod: this.trpcService
        .protectedProcedure()
        .input(GetTimeSpentOnPeriodDto)
        .query(async ({ ctx, input }) =>
          this.codingStatsService.getTimeSpentOnPeriod({
            userId: ctx.user.sub,
            ...input,
          }),
        ),

      getDaysOfPeriodStats: this.trpcService
        .protectedProcedure()
        .input(GetDaysOfPeriodStatsDto)
        .query(async ({ ctx, input }) =>
          this.codingStatsService.getDaysOfPeriodStats({
            userId: ctx.user.sub,
            ...input,
          }),
        ),

      getPeriodLanguagesTime: this.trpcService
        .protectedProcedure()
        .input(GetPeriodLanguagesTimeDto)
        .query(async ({ ctx, input }) =>
          this.codingStatsService.getPeriodLanguagesTime({
            userId: ctx.user.sub,
            ...input,
          }),
        ),

      getPeriodLanguagesPerDay: this.trpcService
        .protectedProcedure()
        .input(GetPeriodLanguagesPerDayDto)
        .query(async ({ ctx, input }) =>
          this.codingStatsService.getPeriodLanguagesPerDay({
            userId: ctx.user.sub,
            ...input,
          }),
        ),

      getDailyStatsForChart: this.trpcService
        .protectedProcedure()
        .input(GetDailyStatsForChartDto)
        .query(async ({ ctx, input }) =>
          this.codingStatsService.getDailyStatsForChart({
            userId: ctx.user.sub,
            dateString: input.dateString,
          }),
        ),

      getPeriodGeneralStats: this.trpcService
        .protectedProcedure()
        .input(GetPeriodGeneralStatsDto)
        .query(async ({ ctx, input }) =>
          this.codingStatsService.getPeriodGeneralStats({
            userId: ctx.user.sub,
            ...input,
          }),
        ),
    }),
  };
}
