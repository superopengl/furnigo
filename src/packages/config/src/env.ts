import { config } from "dotenv";
import { z } from "zod";

// Walk up from any package to find .env at repo root
config({ path: new URL("../../../../.env", import.meta.url).pathname });

const envSchema = z.object({
  FURNIGO_OLTP_DATABASE_URL: z.string().url(),
  FURNIGO_API_AUTH_JWT_SECRET: z.string().min(32),
  FURNIGO_API_SERVICE_PORT: z.coerce.number(),
  NODE_ENV: z.enum(["development", "production", "test"]),

  FURNIGO_R2_ENDPOINT: z.string().url().optional(),
  FURNIGO_R2_ACCESS_KEY: z.string().optional(),
  FURNIGO_R2_SECRET_KEY: z.string().optional(),
  FURNIGO_R2_BUCKET: z.string().optional(),

  FURNIGO_SES_REGION: z.string().optional(),
  FURNIGO_SES_FROM_EMAIL: z.string().email().optional(),

  FURNIGO_OTP_BYPASS_DOMAIN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);
