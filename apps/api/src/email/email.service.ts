import { Resend } from "resend";
import { EnvService } from "src/env/env.service";

import { Injectable } from "@nestjs/common";

import { SendVerificationCodeDtoType } from "./email.dto";
import getEmailBody from "./utils/getEmailBody";

@Injectable()
export class EmailService {
  constructor(private readonly envService: EnvService) {}

  async sendVerificationCode(
    sendVerificationCodeDto: SendVerificationCodeDtoType
  ) {
    const { code, email } = sendVerificationCodeDto;

    const resend = new Resend(this.envService.get("RESEND_API_KEY"));

    resend.emails.send({
      from: this.envService.get("ONBOARDING_EMAIL"),
      to: email,
      subject: "Email verification",
      html: getEmailBody(code),
    });
  }
}
