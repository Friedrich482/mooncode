import { drizzleProvider } from "src/drizzle/drizzle.provider";
import { EnvService } from "src/env/env.service";
import { TrpcService } from "src/trpc/trpc.service";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

import { UsersRouter } from "./users.router";
import { UsersService } from "./users.service";

@Module({
  imports: [ConfigModule, JwtModule],
  providers: [
    ...drizzleProvider,
    UsersService,
    UsersRouter,
    TrpcService,
    EnvService,
  ],
  exports: [UsersService, UsersRouter],
})
export class UsersModule {}
