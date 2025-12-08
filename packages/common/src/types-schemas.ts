import z from "zod";

import {
  PASSWORD_RESET_CODE_LENGTH,
  PENDING_REGISTRATION_CODE_LENGTH,
} from "./constants";

export const JWTDto = z.object({
  sub: z.ulid(),
  iat: z.number().int(),
  exp: z.number().int(),
});

export const SignInUserDto = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
  callbackUrl: z.string().nullable(),
});

export const CreatePendingRegistrationDto = z.object({
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

export const RegisterUserDto = z.object({
  email: z.email(),
  code: z.string().length(PENDING_REGISTRATION_CODE_LENGTH),
  callbackUrl: z.string().nullable(),
});

export const ResetPasswordDto = z.object({
  email: z.email(),
  code: z.string().length(PASSWORD_RESET_CODE_LENGTH),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
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
    { message: "Invalid date" }
  );

export const IsoDateSchema = IsoDateStringSchema.transform(
  (dateStr) => new Date(dateStr)
);
export const DateStringDto = IsoDateStringSchema;

export const GroupByEnum = ["days", "weeks", "months"] as const;
export type GroupBy = (typeof GroupByEnum)[number];

export type PeriodResolution = "day" | "week" | "month" | "year";

export type JwtPayloadDtoType = z.infer<typeof JWTDto>;
export type SignInUserDtoType = z.infer<typeof SignInUserDto>;
export type CreatePendingRegistrationDtoType = z.infer<
  typeof CreatePendingRegistrationDto
>;
export type RegisterUserDtoType = z.infer<typeof RegisterUserDto>;
export type ResetPasswordDtoType = z.infer<typeof ResetPasswordDto>;

export type TrpcAuthError = {
  error: {
    json: {
      message: string;
    };
  };
};
