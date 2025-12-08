import z from "zod";

import { PASSWORD_RESET_CODE_LENGTH } from "@repo/common/constants";

export const CreatePasswordResetDto = z.object({
  email: z.email(),
});

export const VerifyCodeDto = z.object({
  email: z.email(),
  code: z.string().length(PASSWORD_RESET_CODE_LENGTH),
});

export const DeletePasswordResetAfterResetDto = z.object({
  email: z.email(),
});

export type CreatePasswordResetDtoType = z.infer<typeof CreatePasswordResetDto>;
export type VerifyCodeDtoType = z.infer<typeof VerifyCodeDto>;
export type DeletePasswordResetAfterResetDtoType = z.infer<
  typeof DeletePasswordResetAfterResetDto
>;
