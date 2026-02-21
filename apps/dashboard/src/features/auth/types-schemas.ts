import { z } from "zod";

import {
  RegisterUserSchema,
  ResetPasswordSchema,
  VerifyEmailVerificationCodeSchema,
  VerifyPasswordResetCodeSchema,
} from "@repo/common/types-schemas";

export const ResetPasswordFormSchema = z
  .object({
    ...ResetPasswordSchema.shape,
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Passwords must match",
    path: ["confirmPassword"],
  });

export const VerifyEmailVerificationCodeFormSchema =
  VerifyEmailVerificationCodeSchema.omit({ id: true });

export const RegisterFormSchema = RegisterUserSchema.omit({ token: true });

export const VerifyPasswordResetCodeFormSchema =
  VerifyPasswordResetCodeSchema.omit({ id: true });

export type ResetPasswordFormSchemaType = z.infer<
  typeof ResetPasswordFormSchema
>;
export type VerifyEmailVerificationCodeFormSchemaType = z.infer<
  typeof VerifyEmailVerificationCodeFormSchema
>;

export type RegisterFormSchemaType = z.infer<typeof RegisterFormSchema>;

export type VerifyPasswordResetCodeFormSchemaType = z.infer<
  typeof VerifyPasswordResetCodeFormSchema
>;
