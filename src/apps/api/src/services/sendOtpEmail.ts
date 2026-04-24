import { env } from "@furnigo/config";

export async function sendOtpEmail(email: string, code: string) {
  if (env.NODE_ENV !== "production") {
    return;
  }

  // TODO: implement with AWS SES
  throw new Error("Email sending not yet implemented");
}
