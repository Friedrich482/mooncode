import {
  GetDailyStatsDto,
  GetDaysOfPeriodStatsDto,
  GetPeriodGeneralStatsDto,
  GetPeriodLanguagesPerDayDto,
  GetPeriodLanguagesTimeDto,
  GetTimeSpentOnPeriodDto,
} from "src/analytics/dto/general-analytics.dto";
import { GeneralAnalyticsService } from "src/analytics/services/general-analytics.service";
import { TrpcService } from "src/trpc/trpc.service";

import { Injectable } from "@nestjs/common";

@Injectable()
export class GeneralAnalyticsRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly geneGeneralAnalyticsService: GeneralAnalyticsService
  ) {}
  procedures = {
    analytics: {
      general: this.trpcService.trpc.router({
        getTimeSpentOnPeriod: this.trpcService
          .protectedProcedure()
          .input(GetTimeSpentOnPeriodDto)
          .query(async ({ ctx, input }) =>
            this.geneGeneralAnalyticsService.getTimeSpentOnPeriod({
              userId: ctx.user.sub,
              ...input,
            })
          ),

        getDaysOfPeriodStats: this.trpcService
          .protectedProcedure()
          .input(GetDaysOfPeriodStatsDto)
          .query(async ({ ctx, input }) =>
            this.geneGeneralAnalyticsService.getDaysOfPeriodStats({
              userId: ctx.user.sub,
              ...input,
            })
          ),

        getPeriodLanguagesTime: this.trpcService
          .protectedProcedure()
          .input(GetPeriodLanguagesTimeDto)
          .query(async ({ ctx, input }) =>
            this.geneGeneralAnalyticsService.getPeriodLanguagesTime({
              userId: ctx.user.sub,
              ...input,
            })
          ),

        getPeriodLanguagesPerDay: this.trpcService
          .protectedProcedure()
          .input(GetPeriodLanguagesPerDayDto)
          .query(async ({ ctx, input }) =>
            this.geneGeneralAnalyticsService.getPeriodLanguagesPerDay({
              userId: ctx.user.sub,
              ...input,
            })
          ),

        getDailyStats: this.trpcService
          .protectedProcedure()
          .input(GetDailyStatsDto)
          .query(async ({ ctx, input }) =>
            this.geneGeneralAnalyticsService.getDailyStats({
              userId: ctx.user.sub,
              dateString: input.dateString,
            })
          ),

        getPeriodGeneralStats: this.trpcService
          .protectedProcedure()
          .input(GetPeriodGeneralStatsDto)
          .query(async ({ ctx, input }) =>
            this.geneGeneralAnalyticsService.getPeriodGeneralStats({
              userId: ctx.user.sub,
              ...input,
            })
          ),
      }),
    },
  };
}
