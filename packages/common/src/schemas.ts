import z from "zod";

export const JWTDto = z.object({
  sub: z.string().ulid(),
  iat: z.number().int(),
  exp: z.number().int(),
});

export const SignInUserDto = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
  callbackUrl: z.string().nullable(),
});

export const RegisterUserDto = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  callbackUrl: z.string().nullable(),
});

export const loginResponseSchema = z.object({
  result: z.object({
    data: z.object({
      json: z.object({
        access_token: z.string().jwt(),
      }),
    }),
  }),
});

export const IsoDateStringSchema = z
  .string()
  .regex(
    /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    "Date must be in YYYY-MM-DD format",
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
    { message: "Invalid date" },
  );

export const IsoDateSchema = IsoDateStringSchema.transform(
  (dateStr) => new Date(dateStr),
);
export const dateStringDto = IsoDateStringSchema;
