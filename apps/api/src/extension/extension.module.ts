import { DailyDataModule } from "src/daily-data/daily-data.module";
import { FilesModule } from "src/files/files.module";
import { LanguagesModule } from "src/languages/languages.module";
import { ProjectsModule } from "src/projects/projects.module";

import { Module } from "@nestjs/common";

import { ExtensionService } from "./extension.service";

@Module({
  imports: [DailyDataModule, LanguagesModule, ProjectsModule, FilesModule],
  providers: [ExtensionService],
})
export class ExtensionModule {}
