import { db, otpCode } from "@furnigo/db";
import { sql } from "drizzle-orm";

const OTP_EXPIRY_MINUTES = 5;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOtp(email: string) {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  const [result] = await db
    .insert(otpCode)
    .values({ email, code, expiresAt })
    .onConflictDoUpdate({
      target: otpCode.email,
      targetWhere: sql`verified_at IS NULL`,
      set: { code, expiresAt, verifiedAt: null, updatedAt: new Date() },
    })
    .returning({ id: otpCode.id });

  return { id: result.id, code, expiresAt };
}
