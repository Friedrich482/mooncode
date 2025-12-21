import { DrizzleModule } from "src/drizzle/drizzle.module";
import { EmailModule } from "src/email/email.module";
import { EnvModule } from "src/env/env.module";

import { Module } from "@nestjs/common";

import { PendingRegistrationsService } from "./pending-registrations.service";

@Module({
  imports: [DrizzleModule, EmailModule, EnvModule],
  providers: [PendingRegistrationsService],
  exports: [PendingRegistrationsService],
})
export class PendingRegistrationsModule {}
