import { AnalyticsModule } from "src/analytics/analytics.module";
import { AnalyticsRouter } from "src/analytics/routers/analytics.router";
import { AuthModule } from "src/auth/auth.module";
import { AuthRouter } from "src/auth/auth.router";
import { EmailVerificationModule } from "src/email-verifications/email-verifications.module";
import { EnvService } from "src/env/env.service";
import { ExtensionModule } from "src/extension/extension.module";
import { ExtensionRouter } from "src/extension/extension.router";
import { PasswordResetsModule } from "src/password-resets/password-resets.module";

import { Global, Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { TrpcRouter } from "./trpc.router";
import { TrpcService } from "./trpc.service";

@Global()
@Module({
  imports: [
    AuthModule,
    AnalyticsModule,
    ExtensionModule,
    EmailVerificationModule,
    PasswordResetsModule,
  ],
  providers: [
    TrpcService,
    TrpcRouter,
    JwtService,
    EnvService,
    AuthRouter,
    AnalyticsRouter,
    ExtensionRouter,
  ],
  exports: [TrpcService],
})
export class TrpcModule {}
