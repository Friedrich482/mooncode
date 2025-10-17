import { z } from "zod";

export const environmentEnum = ["development", "production"] as const;

export const envSchema = z.object({
  NODE_ENV: z.enum(environmentEnum),
  JWT_SECRET: z.string().trim().min(1),
  DATABASE_URL: z.string().trim().min(1),
  GOOGLE_CLIENT_ID: z.string().trim().min(1),
  GOOGLE_CLIENT_SECRET: z.string().trim().min(1),
  GOOGLE_REDIRECT_URI: z.url(),
});

export type Env = z.infer<typeof envSchema>;
