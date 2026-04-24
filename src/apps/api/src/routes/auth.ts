import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db, user } from "@furnigo/db";
import { eq } from "drizzle-orm";
import { env } from "@furnigo/config";
import { createOtp, verifyOtp } from "../services/otp";
import { signToken } from "../services/jwt";

function isOtpBypassed(email: string): boolean {
  const domain = env.FURNIGO_OTP_BYPASS_DOMAIN;
  return !!domain && email.endsWith(`@${domain}`);
}

const sendSchema = z.object({ email: z.string().email() });
const verifySchema = z.object({ email: z.string().email(), code: z.string().length(6) });

export async function authRoutes(app: FastifyInstance) {
  app.post("/otp/send", async (request, reply) => {
    const body = sendSchema.parse(request.body);

    const [existing] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, body.email))
      .limit(1);

    if (!isOtpBypassed(body.email)) {
      const { code } = await createOtp(body.email);

      // TODO: send email via SES/Resend. For dev, log it.
      app.log.info({ email: body.email, otp: code }, "OTP generated");
    }

    return {
      success: true,
      data: {
        otp_sent: true,
        email: body.email,
        is_new_user: !existing,
        expires_in: 300,
      },
    };
  });

  app.post("/otp/verify", async (request, reply) => {
    const body = verifySchema.parse(request.body);

    if (!isOtpBypassed(body.email)) {
      const otp = await verifyOtp(body.email, body.code);
      if (!otp) {
        return reply.code(400).send({
          success: false,
          error: { code: "INVALID_OTP", message: "Invalid or expired OTP" },
        });
      }
    }

    // Find or create user
    let [existing] = await db
      .select()
      .from(user)
      .where(eq(user.email, body.email))
      .limit(1);

    const isNewUser = !existing;

    if (isNewUser) {
      [existing] = await db
        .insert(user)
        .values({ email: body.email, role: "client" })
        .returning();
    }

    const token = signToken(app, { id: existing.id, role: existing.role });
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    return {
      success: true,
      data: {
        user: {
          id: existing.id,
          email: existing.email,
          displayName: existing.displayName,
          role: existing.role,
        },
        is_new_user: isNewUser,
        token,
        expires_at: expiresAt.toISOString(),
      },
    };
  });
}
