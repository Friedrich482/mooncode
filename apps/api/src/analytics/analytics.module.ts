import { DailyDataModule } from "src/daily-data/daily-data.module";
import { LanguagesModule } from "src/languages/languages.module";

import { Module } from "@nestjs/common";

import { GeneralAnalyticsService } from "./general-analytics.service";
import { ProjectsAnalyticsService } from "./projects-analytics.service";

@Module({
  imports: [DailyDataModule, LanguagesModule],
  providers: [GeneralAnalyticsService, ProjectsAnalyticsService],
})
export class AnalyticsModule {}
