import { AnalyticsModule } from "@/analytics/analytics.module";
import { AuthModule } from "@/auth/auth.module";
import { EmailVerificationModule } from "@/email-verifications/email-verifications.module";
import { EnvService } from "@/env/env.service";
import { ExtensionModule } from "@/extension/extension.module";
import { PasswordResetsModule } from "@/password-resets/password-resets.module";
import { Global, Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { providers } from "./providers/providers";
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
  providers: [TrpcService, ...providers, TrpcRouter, JwtService, EnvService],
  exports: [TrpcService],
})
export class TrpcModule {}
