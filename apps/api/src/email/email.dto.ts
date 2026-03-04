import z from "zod";

import {
  EMAIL_VERIFICATION_CODE_LENGTH,
  PASSWORD_RESET_CODE_LENGTH,
} from "@repo/common/constants";
import { EmailSchema as EmailDto } from "@repo/common/types-schemas";

export const SendEmailDto = z.discriminatedUnion("type", [
  z.object({
    email: EmailDto,
    type: z.literal("onboarding"),
    code: z.string().length(EMAIL_VERIFICATION_CODE_LENGTH),
  }),
  z.object({
    email: EmailDto,
    type: z.literal("email update"),
    code: z.string().length(EMAIL_VERIFICATION_CODE_LENGTH),
  }),
  z.object({
    email: EmailDto,
    type: z.literal("notice email update"),
  }),
  z.object({
    email: EmailDto,
    type: z.literal("password reset"),
    code: z.string().length(PASSWORD_RESET_CODE_LENGTH),
  }),
]);

export type SendEmailDtoType = z.infer<typeof SendEmailDto>;
