import { config } from "dotenv";
import { z } from "zod";

// Walk up from any package to find .env files at repo root
const root = new URL("../../../../", import.meta.url).pathname;
const nodeEnv = process.env.NODE_ENV || "development";
const envFile = nodeEnv === "production" ? ".env.production" : ".env.development";

// Load environment-specific file first, then shared .env as fallback
config({ path: `${root}${envFile}` });
config({ path: `${root}.env` });

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

  FURNIGO_GOOGLE_CLIENT_ID: z.string().optional(),

  FURNIGO_WS_URL: z.string().url().optional(),
  FURNIGO_BLOB_BASE_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);

export const PROJECT_ROOT = root;
export const DEV_UPLOAD_DIR = `${root}devUploadAttachments`;
