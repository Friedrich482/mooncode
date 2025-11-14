import { drizzleProvider } from "src/drizzle/drizzle.provider";
import { EnvService } from "src/env/env.service";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

import { DailyDataService } from "./daily-data.service";

@Module({
  imports: [ConfigModule, JwtModule],
  providers: [...drizzleProvider, DailyDataService, EnvService],
  exports: [DailyDataService],
})
export class DailyDataModule {}
