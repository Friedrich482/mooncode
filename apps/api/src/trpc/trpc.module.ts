import { AuthModule } from "src/auth/auth.module";
import { AuthRouter } from "src/auth/auth.router";
import { CodingStatsModule } from "src/coding-stats/coding-stats.module";
import { CodingStatsRouter } from "src/coding-stats/coding-stats.router";
import { EnvService } from "src/env/env.service";
import { FilesStatsModule } from "src/files-stats/files-stats.module";
import { FilesStatsRouter } from "src/files-stats/files-stats.router";
import { PendingRegistrationsModule } from "src/pending-registrations/pending-registrations.module";
import { PendingRegistrationsRouter } from "src/pending-registrations/pending-registrations.router";

import { Global, Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { TrpcRouter } from "./trpc.router";
import { TrpcService } from "./trpc.service";

@Global()
@Module({
  imports: [
    AuthModule,
    CodingStatsModule,
    FilesStatsModule,
    PendingRegistrationsModule,
  ],
  providers: [
    TrpcService,
    TrpcRouter,
    JwtService,
    EnvService,
    AuthRouter,
    CodingStatsRouter,
    FilesStatsRouter,
    PendingRegistrationsRouter,
  ],
  exports: [TrpcService],
})
export class TrpcModule {}
