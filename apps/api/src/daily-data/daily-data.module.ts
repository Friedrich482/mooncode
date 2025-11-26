import { DrizzleModule } from "src/drizzle/drizzle.module";

import { Module } from "@nestjs/common";

import { DailyDataService } from "./daily-data.service";

@Module({
  imports: [DrizzleModule],

  providers: [DailyDataService],
  exports: [DailyDataService],
})
export class DailyDataModule {}
