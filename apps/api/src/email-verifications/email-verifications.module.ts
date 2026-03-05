import { DrizzleModule } from "src/drizzle/drizzle.module";
import { EmailModule } from "src/email/email.module";
import { EnvModule } from "src/env/env.module";

import { Module } from "@nestjs/common";

import { EmailVerificationsService } from "./email-verifications.service";

@Module({
  imports: [DrizzleModule, EmailModule, EnvModule],
  providers: [EmailVerificationsService],
  exports: [EmailVerificationsService],
})
export class EmailVerificationModule {}
