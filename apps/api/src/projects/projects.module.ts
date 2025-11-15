import { drizzleProvider } from "src/drizzle/drizzle.provider";
import { EnvService } from "src/env/env.service";

import { Module } from "@nestjs/common";

import { ProjectsService } from "./projects.service";
import { ProjectsAnalyticsService } from "./projects-analytics.service";
import { ProjectsCrudService } from "./projects-crud.service";

@Module({
  providers: [
    ...drizzleProvider,
    ProjectsService,
    ProjectsCrudService,
    ProjectsAnalyticsService,
    EnvService,
  ],
  exports: [ProjectsService],
})
export class ProjectsModule {}
