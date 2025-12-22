import { Resend } from "resend";
import { EnvService } from "src/env/env.service";

import { Injectable } from "@nestjs/common";

import {
  SendResetPasswordCodeDtoType,
  SendVerificationCodeDtoType,
} from "./email.dto";
import getOnboardingEmailBody from "./utils/getOnboardingEmailBody";
import getPasswordResetEmailBody from "./utils/getPasswordResetEmailBody";

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
      html: getOnboardingEmailBody(code),
    });
  }

  async sendResetPasswordCode(
    sendResetPasswordCodeDto: SendResetPasswordCodeDtoType
  ) {
    const { code, email } = sendResetPasswordCodeDto;

    const resend = new Resend(this.envService.get("RESEND_API_KEY"));

    resend.emails.send({
      from: this.envService.get("RESET_PASSWORD_EMAIL"),
      to: email,
      subject: "Reset Password",
      html: getPasswordResetEmailBody(code),
    });
  }
}
