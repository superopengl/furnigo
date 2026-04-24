import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db, user } from "@furnigo/db";
import { eq } from "drizzle-orm";
import { env } from "@furnigo/config";
import { createOtp } from "../services/createOtp";
import { verifyOtp } from "../services/verifyOtp";
import { sendOtpEmail } from "../services/sendOtpEmail";
import { createAuthToken } from "../services/createAuthToken";

const sendSchema = z.object({ email: z.string().email() });
const verifySchema = z.object({ otp_id: z.string().uuid(), code: z.string().length(6) });

const TOKEN_EXPIRY_MS = 12 * 60 * 60 * 1000;
const REFRESH_GRACE_SECONDS = 7 * 24 * 60 * 60; // 7 days

export async function authRoutes(app: FastifyInstance) {
  app.post("/otp/send", async (request, reply) => {
    const body = sendSchema.parse(request.body);

    let [existing] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, body.email))
      .limit(1);

    if (!existing) {
      [existing] = await db
        .insert(user)
        .values({ email: body.email, role: "client", isActive: false })
        .returning({ id: user.id });
    }

    const { id: otpId, code } = await createOtp(body.email);

    await sendOtpEmail(body.email, code);

    return {
      success: true,
      data: {
        otp_id: otpId,
        expires_in: 300,
      },
    };
  });

  app.post("/otp/verify", async (request, reply) => {
    const body = verifySchema.parse(request.body);

    const otp = await verifyOtp(body.otp_id, body.code);
    if (!otp) {
      return reply.code(400).send({
        success: false,
        error: { code: "INVALID_OTP", message: "Invalid or expired OTP" },
      });
    }

    // User was created at OTP send with isActive=false — activate on first verify
    let [existing] = await db
      .select()
      .from(user)
      .where(eq(user.email, otp.email))
      .limit(1);

    if (!existing) {
      return reply.code(400).send({
        success: false,
        error: { code: "USER_NOT_FOUND", message: "Please request an OTP first" },
      });
    }

    const isNewUser = !existing.isActive;

    if (isNewUser) {
      [existing] = await db
        .update(user)
        .set({ isActive: true })
        .where(eq(user.id, existing.id))
        .returning();
    }

    const token = createAuthToken(app, { id: existing.id, role: existing.role });
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

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

  app.get("/token/verify", { onRequest: [app.authenticate] }, async (request) => {
    const { id } = request.user as { id: string };

    const [found] = await db
      .select({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        isActive: user.isActive,
      })
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (!found || !found.isActive) {
      return {
        success: false,
        error: { code: "UNAUTHORIZED", message: found ? "Your account has been deactivated" : "User not found" },
      };
    }

    return {
      success: true,
      data: {
        id: found.id,
        email: found.email,
        displayName: found.displayName,
        role: found.role,
      },
    };
  });

  app.post("/token/refresh", async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return reply.code(401).send({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Missing token" },
      });
    }

    const rawToken = authHeader.slice(7);

    let decoded: { id: string; role: string; exp: number };
    try {
      decoded = app.jwt.verify<{ id: string; role: string; exp: number }>(rawToken, {
        ignoreExpiration: true,
      } as any);
    } catch {
      return reply.code(401).send({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Invalid token" },
      });
    }

    // Reject tokens expired beyond the grace window
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && now - decoded.exp > REFRESH_GRACE_SECONDS) {
      return reply.code(401).send({
        success: false,
        error: { code: "TOKEN_EXPIRED", message: "Token expired beyond refresh window. Please log in again." },
      });
    }

    const [found] = await db
      .select()
      .from(user)
      .where(eq(user.id, decoded.id))
      .limit(1);

    if (!found) {
      return reply.code(401).send({
        success: false,
        error: { code: "UNAUTHORIZED", message: "User not found" },
      });
    }

    if (!found.isActive) {
      return reply.code(403).send({
        success: false,
        error: { code: "USER_DEACTIVATED", message: "Your account has been deactivated" },
      });
    }

    const token = createAuthToken(app, { id: found.id, role: found.role });
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

    return {
      success: true,
      data: {
        token,
        expires_at: expiresAt.toISOString(),
      },
    };
  });
}
