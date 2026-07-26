import { DrizzleModule } from "@/drizzle/drizzle.module";
import { Module } from "@nestjs/common";

import { TelemetryService } from "./telemetry.service";

@Module({
  imports: [DrizzleModule],
  providers: [TelemetryService],
  exports: [TelemetryService],
})
export class TelemetryModule {}
