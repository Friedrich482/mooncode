import { BranchesModule } from "@/branches/branches.module";
import { DailyDataModule } from "@/daily-data/daily-data.module";
import { FilesModule } from "@/files/files.module";
import { LanguagesModule } from "@/languages/languages.module";
import { ProjectsModule } from "@/projects/projects.module";
import { TelemetryModule } from "@/telemetry/telemetry.module";
import { Module } from "@nestjs/common";

import { ExtensionRouter } from "./extension.router";
import { ExtensionService } from "./extension.service";

@Module({
  imports: [
    TelemetryModule,
    DailyDataModule,
    LanguagesModule,
    ProjectsModule,
    BranchesModule,
    FilesModule,
  ],
  providers: [ExtensionService, ExtensionRouter],
  exports: [ExtensionService, ExtensionRouter],
})
export class ExtensionModule {}
