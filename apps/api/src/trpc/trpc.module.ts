import { AnalyticsModule } from "src/analytics/analytics.module";
import { GeneralAnalyticsRouter } from "src/analytics/routers/general-analytics.router";
import { ProjectAnalyticsRouter } from "src/analytics/routers/projects-analytics.router";
import { AuthModule } from "src/auth/auth.module";
import { AuthRouter } from "src/auth/auth.router";
import { EnvService } from "src/env/env.service";
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
    AnalyticsModule,
    PendingRegistrationsModule,
    PasswordResetsModule,
  ],
  providers: [
    TrpcService,
    TrpcRouter,
    JwtService,
    EnvService,
    AuthRouter,
    GeneralAnalyticsRouter,
    ProjectAnalyticsRouter,
  ],
  exports: [TrpcService],
})
export class TrpcModule {}
