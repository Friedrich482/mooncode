import {
  GetDailyStatsDto,
  GetDaysOfPeriodStatsDto,
  GetPeriodGeneralStatsDto,
  GetPeriodLanguagesPerDayDto,
  GetPeriodLanguagesTimeDto,
  GetTimeSpentOnPeriodDto,
} from "@/analytics/dto/general-analytics.dto";
import { GeneralAnalyticsService } from "@/analytics/services/general-analytics.service";
import { TrpcService } from "@/trpc/trpc.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GeneralAnalyticsRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly generalAnalyticsService: GeneralAnalyticsService,
  ) {}
  procedures = {
    general: this.trpcService.trpc.router({
      getTimeSpentOnPeriod: this.trpcService
        .protectedProcedure()
        .input(GetTimeSpentOnPeriodDto)
        .query(async ({ ctx, input }) =>
          this.generalAnalyticsService.getTimeSpentOnPeriod({
            userId: ctx.user.sub,
            ...input,
          }),
        ),

      getDaysOfPeriodStats: this.trpcService
        .protectedProcedure()
        .input(GetDaysOfPeriodStatsDto)
        .query(async ({ ctx, input }) =>
          this.generalAnalyticsService.getDaysOfPeriodStats({
            userId: ctx.user.sub,
            ...input,
          }),
        ),

      getPeriodLanguagesTime: this.trpcService
        .protectedProcedure()
        .input(GetPeriodLanguagesTimeDto)
        .query(async ({ ctx, input }) =>
          this.generalAnalyticsService.getPeriodLanguagesTime({
            userId: ctx.user.sub,
            ...input,
          }),
        ),

      getPeriodLanguagesPerDay: this.trpcService
        .protectedProcedure()
        .input(GetPeriodLanguagesPerDayDto)
        .query(async ({ ctx, input }) =>
          this.generalAnalyticsService.getPeriodLanguagesPerDay({
            userId: ctx.user.sub,
            ...input,
          }),
        ),

      getDailyStats: this.trpcService
        .protectedProcedure()
        .input(GetDailyStatsDto)
        .query(async ({ ctx, input }) =>
          this.generalAnalyticsService.getDailyStats({
            userId: ctx.user.sub,
            dateString: input.dateString,
          }),
        ),

      getPeriodGeneralStats: this.trpcService
        .protectedProcedure()
        .input(GetPeriodGeneralStatsDto)
        .query(async ({ ctx, input }) =>
          this.generalAnalyticsService.getPeriodGeneralStats({
            userId: ctx.user.sub,
            ...input,
          }),
        ),
    }),
  };
}
