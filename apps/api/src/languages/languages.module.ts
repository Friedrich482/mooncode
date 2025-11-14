import { drizzleProvider } from "src/drizzle/drizzle.provider";
import { EnvService } from "src/env/env.service";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { LanguagesService } from "./languages.service";

@Module({
  imports: [ConfigModule],
  providers: [...drizzleProvider, LanguagesService, EnvService],
  exports: [LanguagesService],
})
export class LanguagesModule {}
