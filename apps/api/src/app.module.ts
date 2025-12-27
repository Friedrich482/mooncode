import { envSchema } from "src/env";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

import { AnalyticsModule } from './analytics/analytics.module';
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { CodingStatsModule } from "./coding-stats/coding-stats.module";
import { DailyDataModule } from "./daily-data/daily-data.module";
import { DrizzleModule } from "./drizzle/drizzle.module";
import { EmailModule } from "./email/email.module";
import { EnvModule } from "./env/env.module";
import { EnvService } from "./env/env.service";
import { ExtensionModule } from './extension/extension.module';
import { FilesModule } from "./files/files.module";
import { FilesStatsModule } from "./files-stats/files-stats.module";
import { LanguagesModule } from "./languages/languages.module";
import { PasswordResetsModule } from "./password-resets/password-resets.module";
import { PendingRegistrationsModule } from "./pending-registrations/pending-registrations.module";
import { ProjectsModule } from "./projects/projects.module";
import { TrpcModule } from "./trpc/trpc.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env) => envSchema.parse(env),
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: "default",
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    UsersModule,
    AuthModule,
    DrizzleModule,
    CodingStatsModule,
    DailyDataModule,
    LanguagesModule,
    TrpcModule,
    EnvModule,
    FilesModule,
    ProjectsModule,
    FilesStatsModule,
    PendingRegistrationsModule,
    EmailModule,
    PasswordResetsModule,
    AnalyticsModule,
    ExtensionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    EnvService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [],
})
export class AppModule {}
