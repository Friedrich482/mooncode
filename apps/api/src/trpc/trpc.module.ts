import { AuthModule } from "src/auth/auth.module";
import { CodingStatsModule } from "src/coding-stats/coding-stats.module";
import { DailyDataModule } from "src/daily-data/daily-data.module";
import { EnvService } from "src/env/env.service";
import { FilesStatsModule } from "src/files-stats/files-stats.module";
import { LanguagesModule } from "src/languages/languages.module";
import { PendingRegistrationsModule } from "src/pending-registrations/pending-registrations.module";
import { UsersModule } from "src/users/users.module";

import { Global, Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { TrpcRouter } from "./trpc.router";
import { TrpcService } from "./trpc.service";

@Global()
@Module({
  imports: [
    UsersModule,
    DailyDataModule,
    CodingStatsModule,
    LanguagesModule,
    AuthModule,
    FilesStatsModule,
    PendingRegistrationsModule,
  ],
  providers: [TrpcService, TrpcRouter, JwtService, EnvService],
  exports: [TrpcService],
})
export class TrpcModule {}
