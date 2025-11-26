import { DrizzleModule } from "src/drizzle/drizzle.module";

import { Module } from "@nestjs/common";

import { FilesService } from "./files.service";

@Module({
  imports: [DrizzleModule],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
