import { DailyDataModule } from "src/daily-data/daily-data.module";
import { DrizzleModule } from "src/drizzle/drizzle.module";
import { LanguagesModule } from "src/languages/languages.module";
import { ProjectsModule } from "src/projects/projects.module";

import { Module } from "@nestjs/common";

import { GeneralAnalyticsService } from "./general-analytics.service";
import { ProjectsAnalyticsService } from "./projects-analytics.service";

@Module({
  imports: [DrizzleModule, DailyDataModule, LanguagesModule, ProjectsModule],
  providers: [GeneralAnalyticsService, ProjectsAnalyticsService],
})
export class AnalyticsModule {}
