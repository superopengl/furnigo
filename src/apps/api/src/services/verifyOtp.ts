import { db, otpCode } from "@furnigo/db";
import { eq, and, isNull, gt } from "drizzle-orm";

export async function verifyOtp(otpId: string, code: string) {
  const result = await db
    .update(otpCode)
    .set({ verifiedAt: new Date() })
    .where(
      and(
        eq(otpCode.id, otpId),
        eq(otpCode.code, code),
        isNull(otpCode.verifiedAt),
        gt(otpCode.expiresAt, new Date()),
      ),
    )
    .returning();

  return result.length > 0 ? result[0] : null;
}
