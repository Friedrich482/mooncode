import { TrpcService } from "src/trpc/trpc.service";

import { Injectable } from "@nestjs/common";

import {
  checkProjectExistsDto,
  GetDailyFilesStatsForExtensionDto,
  GetPeriodProjectsDto,
  GetProjectFilesOnPeriodDto,
  GetProjectLanguagesPerDayOfPeriodDto,
  GetProjectLanguagesTimeOnPeriodDto,
  GetProjectOnPeriodDto,
  GetProjectPerDayOfPeriodDto,
  UpsertFilesDto,
} from "./files-stats.dto";
import { FilesStatsService } from "./files-stats.service";

@Injectable()
export class FilesStatsRouter {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly filesStatsService: FilesStatsService
  ) {}

  procedures = {
    filesStats: this.trpcService.trpc.router({
      getDailyFilesStatsForExtension: this.trpcService
        .protectedProcedure()
        .input(GetDailyFilesStatsForExtensionDto)
        .query(async ({ ctx, input }) =>
          this.filesStatsService.getDailyFilesStatsForExtension({
            userId: ctx.user.sub,
            ...input,
          })
        ),

      upsert: this.trpcService
        .protectedProcedure()
        .input(UpsertFilesDto)
        .mutation(async ({ ctx, input }) =>
          this.filesStatsService.upsert({
            userId: ctx.user.sub,
            ...input,
          })
        ),

      checkProjectExists: this.trpcService
        .protectedProcedure()
        .input(checkProjectExistsDto)
        .query(async ({ ctx, input }) =>
          this.filesStatsService.checkProjectExists({
            ...input,
            userId: ctx.user.sub,
          })
        ),

      getPeriodProjects: this.trpcService
        .protectedProcedure()
        .input(GetPeriodProjectsDto)
        .query(async ({ ctx, input }) =>
          this.filesStatsService.getPeriodProjects({
            userId: ctx.user.sub,
            ...input,
          })
        ),

      getProjectOnPeriod: this.trpcService
        .protectedProcedure()
        .input(GetProjectOnPeriodDto)
        .query(async ({ ctx, input }) =>
          this.filesStatsService.getProjectOnPeriod({
            userId: ctx.user.sub,
            ...input,
          })
        ),

      getProjectPerDayOfPeriod: this.trpcService
        .protectedProcedure()
        .input(GetProjectPerDayOfPeriodDto)
        .query(async ({ ctx, input }) =>
          this.filesStatsService.getProjectPerDayOfPeriod({
            userId: ctx.user.sub,
            ...input,
          })
        ),

      getProjectLanguagesTimeOnPeriod: this.trpcService
        .protectedProcedure()
        .input(GetProjectLanguagesTimeOnPeriodDto)
        .query(async ({ ctx, input }) =>
          this.filesStatsService.getProjectLanguagesTimeOnPeriod({
            userId: ctx.user.sub,
            ...input,
          })
        ),

      getProjectLanguagesPerDayOfPeriod: this.trpcService
        .protectedProcedure()
        .input(GetProjectLanguagesPerDayOfPeriodDto)
        .query(async ({ ctx, input }) =>
          this.filesStatsService.getProjectLanguagesPerDayOfPeriod({
            userId: ctx.user.sub,
            ...input,
          })
        ),

      getProjectFilesOnPeriod: this.trpcService
        .protectedProcedure()
        .input(GetProjectFilesOnPeriodDto)
        .query(async ({ ctx, input }) =>
          this.filesStatsService.getProjectFilesOnPeriod({
            userId: ctx.user.sub,
            ...input,
          })
        ),
    }),
  };
}
