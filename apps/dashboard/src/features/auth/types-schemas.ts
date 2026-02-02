import { z } from "zod";

import { ResetPasswordSchema } from "@repo/common/types-schemas";

export const ResetPasswordFormSchema = z
  .object({
    ...ResetPasswordSchema.shape,
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Passwords must match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormSchemaType = z.infer<
  typeof ResetPasswordFormSchema
>;
