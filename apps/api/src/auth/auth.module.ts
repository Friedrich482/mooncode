import { AuthController } from "./auth.controller";
import { AuthRouter } from "./auth.router";
import { AuthService } from "./auth.service";
import { ConfigModule } from "@nestjs/config";
import { EnvModule } from "src/env/env.module";
import { EnvService } from "src/env/env.service";
import { JwtModule } from "@nestjs/jwt";
import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [
    ConfigModule,
    UsersModule,
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
