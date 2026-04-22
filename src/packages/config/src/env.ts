import { config } from "dotenv";
import { z } from "zod";

// Walk up from any package to find .env at repo root
config({ path: new URL("../../../../.env", import.meta.url).pathname });

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  PORT: z.coerce.number(),
  NODE_ENV: z.enum(["development", "production", "test"]),

  R2_ENDPOINT: z.string().url().optional(),
  R2_ACCESS_KEY: z.string().optional(),
  R2_SECRET_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),

  SES_REGION: z.string().optional(),
  SES_FROM_EMAIL: z.string().email().optional(),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);
