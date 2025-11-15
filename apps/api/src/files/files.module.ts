import { drizzleProvider } from "src/drizzle/drizzle.provider";
import { EnvService } from "src/env/env.service";

import { Module } from "@nestjs/common";

import { FilesService } from "./files.service";

@Module({
  providers: [...drizzleProvider, FilesService, EnvService],
  exports: [FilesService],
})
export class FilesModule {}
