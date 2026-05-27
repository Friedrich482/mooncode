import { Resend } from "resend";

import { EnvService } from "@/env/env.service";
import { Module } from "@nestjs/common";

import { EmailService } from "./email.service";

@Module({
  providers: [
    EnvService,
    EmailService,
    {
      provide: "resend",
      useFactory: (envService: EnvService) => {
        const resend = new Resend(envService.get("RESEND_API_KEY"));

        return resend;
      },
      inject: [EnvService],
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
