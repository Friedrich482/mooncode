import { DailyDataService } from "src/daily-data/daily-data.service";
import { DrizzleModule } from "src/drizzle/drizzle.module";
import { FilesService } from "src/files/files.service";
import { LanguagesService } from "src/languages/languages.service";
import { ProjectsModule } from "src/projects/projects.module";

import { Module } from "@nestjs/common";

import { FilesStatsRouter } from "./files-stats.router";
import { FilesStatsService } from "./files-stats.service";
import { FilesStatsDashboardService } from "./files-stats-dashboard.service";
import { FilesStatsExtensionService } from "./files-stats-extension.service";

@Module({
  imports: [DrizzleModule, ProjectsModule],
  providers: [
    FilesService,
    DailyDataService,
    LanguagesService,
    FilesStatsService,
    FilesStatsRouter,
    FilesStatsDashboardService,
    FilesStatsExtensionService,
  ],
  exports: [FilesStatsService, FilesStatsRouter],
})
export class FilesStatsModule {}
