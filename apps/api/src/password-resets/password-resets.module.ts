import { DrizzleModule } from "src/drizzle/drizzle.module";
import { EmailModule } from "src/email/email.module";

import { Module } from "@nestjs/common";

import { PasswordResetsService } from "./password-resets.service";

@Module({
  imports: [EmailModule, DrizzleModule],
  providers: [PasswordResetsService],
  exports: [PasswordResetsService],
})
export class PasswordResetsModule {}
