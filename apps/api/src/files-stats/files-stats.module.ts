import { DailyDataModule } from "src/daily-data/daily-data.module";
import { drizzleProvider } from "src/drizzle/drizzle.provider";
import { EnvModule } from "src/env/env.module";
import { FilesModule } from "src/files/files.module";
import { LanguagesModule } from "src/languages/languages.module";
import { ProjectsModule } from "src/projects/projects.module";

import { Module } from "@nestjs/common";

import { FilesStatsRouter } from "./files-stats.router";
import { FilesStatsService } from "./files-stats.service";
import { FilesStatsDashboardService } from "./files-stats-dashboard.service";
import { FilesStatsExtensionService } from "./files-stats-extension.service";

@Module({
  imports: [
    ProjectsModule,
    FilesModule,
    LanguagesModule,
    DailyDataModule,
    EnvModule,
  ],
  providers: [
    FilesStatsService,
    FilesStatsRouter,
    FilesStatsDashboardService,
    FilesStatsExtensionService,
    ...drizzleProvider,
  ],
  exports: [FilesStatsService, FilesStatsRouter],
})
export class FilesStatsModule {}
