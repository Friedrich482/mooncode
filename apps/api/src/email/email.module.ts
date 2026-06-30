import { EnvModule } from "@/env/env.module";
import { Module } from "@nestjs/common";

import { EmailService } from "./email.service";
import { resendProvider } from "./providers/resend.provider";

@Module({
  imports: [EnvModule],
  providers: [EmailService, resendProvider],
  exports: [EmailService],
})
export class EmailModule {}
