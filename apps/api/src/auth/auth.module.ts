import { EmailModule } from "@/email/email.module";
import { EmailVerificationModule } from "@/email-verifications/email-verifications.module";
import { EnvModule } from "@/env/env.module";
import { EnvService } from "@/env/env.service";
import { PasswordResetsModule } from "@/password-resets/password-resets.module";
import { UsersModule } from "@/users/users.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

import { AuthController } from "./auth.controller";
import { AuthRouter } from "./auth.router";
import { AuthService } from "./auth.service";

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    EmailVerificationModule,
    PasswordResetsModule,
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule, EnvModule],
      useFactory: async (envService: EnvService) => ({
        global: true,
        secret: envService.get("JWT_SECRET"),
        signOptions: { expiresIn: "28d" },
      }),
      inject: [EnvService],
    }),
  ],
  providers: [AuthService, AuthRouter, EnvService],
  exports: [AuthService, AuthRouter],
  controllers: [AuthController],
})
export class AuthModule {}
