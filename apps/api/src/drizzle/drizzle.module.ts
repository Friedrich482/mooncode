import { EnvModule } from "@/env/env.module";
import { Module } from "@nestjs/common";

import { DRIZZLE_ASYNC_PROVIDER } from "./constants";
import { drizzleProvider } from "./providers/drizzle.provider";

@Module({
  imports: [EnvModule],
  providers: [drizzleProvider],
  exports: [DRIZZLE_ASYNC_PROVIDER],
})
export class DrizzleModule {}
