import { db, otpCode } from "@furnigo/db";
import { eq, and, isNull, gt, desc } from "drizzle-orm";

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
