import { DrizzleModule } from "src/drizzle/drizzle.module";

import { Module } from "@nestjs/common";

import { UsersService } from "./users.service";

@Module({
  imports: [DrizzleModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
