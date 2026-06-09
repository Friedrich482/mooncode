import { envSchema } from "@/env";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

import { AnalyticsModule } from "./analytics/analytics.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AppRouterModule } from "./app-router/app-router.module";
import { AuthModule } from "./auth/auth.module";
import { DailyDataModule } from "./daily-data/daily-data.module";
import { DrizzleModule } from "./drizzle/drizzle.module";
import { EmailModule } from "./email/email.module";
import { EmailVerificationModule } from "./email-verifications/email-verifications.module";
import { EnvModule } from "./env/env.module";
import { ExtensionModule } from "./extension/extension.module";
import { FilesModule } from "./files/files.module";
import { LanguagesModule } from "./languages/languages.module";
import { PasswordResetsModule } from "./password-resets/password-resets.module";
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
    DailyDataModule,
    LanguagesModule,
    TrpcModule,
    AppRouterModule,
    EnvModule,
    FilesModule,
    ProjectsModule,
    EmailVerificationModule,
    EmailModule,
    PasswordResetsModule,
    AnalyticsModule,
    ExtensionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [],
})
export class AppModule {}
