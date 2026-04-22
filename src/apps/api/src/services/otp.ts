import { db, otpCode } from "@furnigo/db";
import { eq, and, isNull, gt, desc } from "drizzle-orm";

const OTP_EXPIRY_MINUTES = 5;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOtp(email: string) {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await db.insert(otpCode).values({ email, code, expiresAt });

  return { code, expiresAt };
}

export async function verifyOtp(email: string, code: string) {
  const [otp] = await db
    .select()
    .from(otpCode)
    .where(
      and(
        eq(otpCode.email, email),
        eq(otpCode.code, code),
        isNull(otpCode.verifiedAt),
        gt(otpCode.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(otpCode.createdAt))
    .limit(1);

  if (!otp) return null;

  await db
    .update(otpCode)
    .set({ verifiedAt: new Date() })
    .where(eq(otpCode.id, otp.id));

  return otp;
}
