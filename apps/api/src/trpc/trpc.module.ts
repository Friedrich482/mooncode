import { AnalyticsModule } from "@/analytics/analytics.module";
import { AnalyticsRouter } from "@/analytics/routers/analytics.router";
import { AuthModule } from "@/auth/auth.module";
import { AuthRouter } from "@/auth/auth.router";
import { EmailVerificationModule } from "@/email-verifications/email-verifications.module";
import { EnvService } from "@/env/env.service";
import { ExtensionModule } from "@/extension/extension.module";
import { ExtensionRouter } from "@/extension/extension.router";
import { PasswordResetsModule } from "@/password-resets/password-resets.module";
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
