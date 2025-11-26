import { DrizzleModule } from "src/drizzle/drizzle.module";
import { EmailService } from "src/email/email.service";
import { EnvService } from "src/env/env.service";

import { Module } from "@nestjs/common";

import { PendingRegistrationsService } from "./pending-registrations.service";

@Module({
  imports: [DrizzleModule],
  providers: [PendingRegistrationsService, EnvService, EmailService],
  exports: [PendingRegistrationsService],
})
export class PendingRegistrationsModule {}
