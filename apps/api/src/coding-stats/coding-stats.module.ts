import { DailyDataService } from "src/daily-data/daily-data.service";
import { DrizzleModule } from "src/drizzle/drizzle.module";
import { LanguagesService } from "src/languages/languages.service";

import { Module } from "@nestjs/common";

import { CodingStatsRouter } from "./coding-stats.router";
import { CodingStatsService } from "./coding-stats.service";
import { CodingStatsDashboardService } from "./coding-stats-dashboard.service";
import { CodingStatsExtensionService } from "./coding-stats-extension.service";

@Module({
  imports: [DrizzleModule],
  providers: [
    CodingStatsService,
    CodingStatsDashboardService,
    CodingStatsExtensionService,
    CodingStatsRouter,
    DailyDataService,
    LanguagesService,
  ],
  exports: [CodingStatsService, CodingStatsRouter],
})
export class CodingStatsModule {}
