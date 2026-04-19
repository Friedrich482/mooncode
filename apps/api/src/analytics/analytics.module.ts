import { DailyDataModule } from "@/daily-data/daily-data.module";
import { DrizzleModule } from "@/drizzle/drizzle.module";
import { LanguagesModule } from "@/languages/languages.module";
import { ProjectsModule } from "@/projects/projects.module";
import { Module } from "@nestjs/common";

import { AnalyticsRouter } from "./routers/analytics.router";
import { GeneralAnalyticsRouter } from "./routers/general-analytics.router";
import { ProjectsAnalyticsRouter } from "./routers/projects-analytics.router";
import { GeneralAnalyticsService } from "./services/general-analytics.service";
import { ProjectsAnalyticsService } from "./services/projects-analytics.service";

@Module({
  imports: [DrizzleModule, DailyDataModule, LanguagesModule, ProjectsModule],
  providers: [
    GeneralAnalyticsRouter,
    AnalyticsRouter,
    ProjectsAnalyticsRouter,
    GeneralAnalyticsService,
    ProjectsAnalyticsService,
  ],
  exports: [
    GeneralAnalyticsRouter,
    ProjectsAnalyticsRouter,
    AnalyticsRouter,
    GeneralAnalyticsService,
    ProjectsAnalyticsService,
  ],
})
export class AnalyticsModule {}
