import {
  CheckProjectExistsDto,
  GetPeriodProjectsDto,
  GetProjectDailyStatsDto,
  GetProjectFilesOnPeriodDto,
  GetProjectLanguagesPerDayOfPeriodDto,
  GetProjectLanguagesTimeOnPeriodDto,
  GetProjectOnPeriodDto,
  GetProjectPerDayOfPeriodDto,
} from "src/analytics/dto/projects-analytics.dto";
import { ProjectsAnalyticsService } from "src/analytics/services/projects-analytics.service";
import { TrpcService } from "src/trpc/trpc.service";

import { Injectable } from "@nestjs/common";

@Injectable()
export class ProjectsAnalyticsRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly projectsAnalyticsService: ProjectsAnalyticsService,
  ) {}

  procedures = {
    projects: this.trpcService.trpc.router({
      checkProjectExists: this.trpcService
        .protectedProcedure()
        .input(CheckProjectExistsDto)
        .query(async ({ ctx, input }) =>
          this.projectsAnalyticsService.checkProjectExists({
            ...input,
            userId: ctx.user.sub,
          }),
        ),

      getPeriodProjects: this.trpcService
        .protectedProcedure()
        .input(GetPeriodProjectsDto)
        .query(async ({ ctx, input }) =>
          this.projectsAnalyticsService.getPeriodProjects({
            userId: ctx.user.sub,
            ...input,
          }),
        ),

      getProjectOnPeriod: this.trpcService
        .protectedProcedure()
        .input(GetProjectOnPeriodDto)
        .query(async ({ ctx, input }) =>
          this.projectsAnalyticsService.getProjectOnPeriod({
            userId: ctx.user.sub,
            ...input,
          }),
        ),

      getProjectPerDayOfPeriod: this.trpcService
        .protectedProcedure()
        .input(GetProjectPerDayOfPeriodDto)
        .query(async ({ ctx, input }) =>
          this.projectsAnalyticsService.getProjectPerDayOfPeriod({
            userId: ctx.user.sub,
            ...input,
          }),
        ),

      getProjectLanguagesTimeOnPeriod: this.trpcService
        .protectedProcedure()
        .input(GetProjectLanguagesTimeOnPeriodDto)
        .query(async ({ ctx, input }) =>
          this.projectsAnalyticsService.getProjectLanguagesTimeOnPeriod({
            userId: ctx.user.sub,
            ...input,
          }),
        ),

      getProjectLanguagesPerDayOfPeriod: this.trpcService
        .protectedProcedure()
        .input(GetProjectLanguagesPerDayOfPeriodDto)
        .query(async ({ ctx, input }) =>
          this.projectsAnalyticsService.getProjectLanguagesPerDayOfPeriod({
            userId: ctx.user.sub,
            ...input,
          }),
        ),

      getProjectDailyStats: this.trpcService
        .protectedProcedure()
        .input(GetProjectDailyStatsDto)
        .query(async ({ input, ctx }) =>
          this.projectsAnalyticsService.getProjectDailyStats({
            userId: ctx.user.sub,
            ...input,
          }),
        ),

      getProjectFilesOnPeriod: this.trpcService
        .protectedProcedure()
        .input(GetProjectFilesOnPeriodDto)
        .query(async ({ ctx, input }) =>
          this.projectsAnalyticsService.getFilesOnPeriod({
            userId: ctx.user.sub,
            ...input,
          }),
        ),
    }),
  };
}
