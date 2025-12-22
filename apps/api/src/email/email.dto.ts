import z from "zod";

import { PASSWORD_RESET_CODE_LENGTH } from "@repo/common/constants";

export const SendVerificationCodeDto = z.object({
  email: z.email(),
  code: z.string().length(PASSWORD_RESET_CODE_LENGTH),
});

export const SendResetPasswordCodeDto = SendVerificationCodeDto;

export type SendVerificationCodeDtoType = z.infer<
  typeof SendVerificationCodeDto
>;

export type SendResetPasswordCodeDtoType = z.infer<
  typeof SendResetPasswordCodeDto
>;
