import { EnvService } from "src/env/env.service";

import { Module } from "@nestjs/common";

import { EmailService } from "./email.service";

@Module({
  providers: [EnvService, EmailService],
  exports: [EmailService],
})
export class EmailModule {}
