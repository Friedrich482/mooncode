import { DrizzleModule } from "@/drizzle/drizzle.module";
import { Module } from "@nestjs/common";

import { ProjectsService } from "./projects.service";

@Module({
  imports: [DrizzleModule],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
