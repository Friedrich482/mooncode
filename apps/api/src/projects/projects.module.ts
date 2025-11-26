import { DrizzleModule } from "src/drizzle/drizzle.module";

import { Module } from "@nestjs/common";

import { ProjectsService } from "./projects.service";
import { ProjectsAnalyticsService } from "./projects-analytics.service";
import { ProjectsCrudService } from "./projects-crud.service";

@Module({
  imports: [DrizzleModule],
  providers: [ProjectsService, ProjectsCrudService, ProjectsAnalyticsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
