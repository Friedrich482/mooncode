import z from "zod";

import {
  EXTENSION_ID,
  PASSWORD_RESET_CODE_LENGTH,
  PENDING_REGISTRATION_CODE_LENGTH,
  PUBLISHER,
} from "./constants";

export const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const VSCodeCallbackUrlSchema = z
  .url()
  .startsWith("vscode://")
  .refine(
    (urlStr) => {
      const url = new URL(urlStr);
      const [publisher] = url.hostname.split(".");
      return publisher === PUBLISHER;
    },
    { error: "Invalid publisher", abort: true }
  )
  .refine(
    (urlStr) => {
      const url = new URL(urlStr);
      const [, extensionId] = url.hostname.split(".");
      return extensionId === EXTENSION_ID;
    },
    { error: "Invalid extension id", abort: true }
  )
  .refine(
    (urlStr) => {
      const url = new URL(urlStr);
      const state = url.searchParams.get("state");

      return state;
    },
    { error: "State parameter is required" }
  );

export const JWTDto = z.object({
  sub: z.ulid(),
  iat: z.number().int(),
  exp: z.number().int(),
});

export const SignInUserSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
  callbackUrl: VSCodeCallbackUrlSchema.nullable(),
});

export const CreatePendingRegistrationDto = z.object({
  email: z.email(),
  password: PasswordSchema,
  username: z.string().min(3, "Username must be at least 3 characters"),
});

export const RegisterUserDto = z.object({
  email: z.email(),
  code: z.string().length(PENDING_REGISTRATION_CODE_LENGTH),
  callbackUrl: VSCodeCallbackUrlSchema.nullable(),
});

export const CreatePasswordResetDto = z.object({
  email: z.email(),
});

export const VerifyPasswordResetCodeDto = z.object({
  email: z.email(),
  code: z.string().length(PASSWORD_RESET_CODE_LENGTH),
});

export const ResetPasswordDto = z.object({
  email: z.email(),
  token: z.ulid(),
  newPassword: PasswordSchema,
});

export const IsoDateStringSchema = z
  .string()
  .regex(
    /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    "Date must be in YYYY-MM-DD format"
  )
  .refine(
    (dateStr) => {
      const date = new Date(dateStr);
      const [year, month, day] = dateStr.split("-").map(Number);

      return (
        date instanceof Date &&
        !isNaN(date.getTime()) &&
        date.getUTCFullYear() === year &&
        date.getUTCMonth() + 1 === month &&
        date.getUTCDate() === day
      );
    },
    { error: "Invalid date" }
  );

export const IsoDateSchema = IsoDateStringSchema.transform(
  (dateStr) => new Date(dateStr)
);
export const DateStringDto = IsoDateStringSchema;

export const GroupByEnum = ["days", "weeks", "months"] as const;
export type GroupBy = (typeof GroupByEnum)[number];

export type PeriodResolution = "day" | "week" | "month" | "year";

export type JwtPayloadDtoType = z.infer<typeof JWTDto>;
export type SignInUser = z.infer<typeof SignInUserSchema>;
export type CreatePendingRegistrationDtoType = z.infer<
  typeof CreatePendingRegistrationDto
>;
export type RegisterUserDtoType = z.infer<typeof RegisterUserDto>;
export type CreatePasswordResetDtoType = z.infer<typeof CreatePasswordResetDto>;
export type VerifyPasswordResetCodeDtoType = z.infer<
  typeof VerifyPasswordResetCodeDto
>;
export type ResetPasswordDtoType = z.infer<typeof ResetPasswordDto>;
