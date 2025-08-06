import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  JWT_SECRET: z.string().trim().min(1),
  DATABASE_URL: z.string().trim().min(1),
});

export type Env = z.infer<typeof envSchema>;
