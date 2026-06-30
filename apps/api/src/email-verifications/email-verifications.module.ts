import { DrizzleModule } from "@/drizzle/drizzle.module";
import { EmailModule } from "@/email/email.module";
import { Module } from "@nestjs/common";

import { EmailVerificationsService } from "./email-verifications.service";

@Module({
  imports: [DrizzleModule, EmailModule],
  providers: [EmailVerificationsService],
  exports: [EmailVerificationsService],
})
export class EmailVerificationModule {}
