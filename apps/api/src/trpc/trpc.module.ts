import { AuthModule } from "src/auth/auth.module";
import { AuthRouter } from "src/auth/auth.router";
import { CodingStatsModule } from "src/coding-stats/coding-stats.module";
import { CodingStatsRouter } from "src/coding-stats/coding-stats.router";
import { EnvService } from "src/env/env.service";
import { FilesStatsModule } from "src/files-stats/files-stats.module";
import { FilesStatsRouter } from "src/files-stats/files-stats.router";
import { PasswordResetsModule } from "src/password-resets/password-resets.module";
import { PendingRegistrationsModule } from "src/pending-registrations/pending-registrations.module";

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
    PasswordResetsModule,
  ],
  providers: [
    TrpcService,
    TrpcRouter,
    JwtService,
    EnvService,
    AuthRouter,
    CodingStatsRouter,
    FilesStatsRouter,
  ],
  exports: [TrpcService],
})
export class TrpcModule {}
