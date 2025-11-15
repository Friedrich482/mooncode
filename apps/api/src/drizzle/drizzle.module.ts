import { EnvService } from "src/env/env.service";

import { Module } from "@nestjs/common";

import { DrizzleAsyncProvider, drizzleProvider } from "./drizzle.provider";

@Module({
  providers: [...drizzleProvider, EnvService],
  exports: [DrizzleAsyncProvider],
})
export class DrizzleModule {}
