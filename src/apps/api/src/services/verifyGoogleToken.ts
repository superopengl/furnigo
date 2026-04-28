import { env } from "@furnigo/config";

interface GoogleTokenPayload {
  sub: string;
  email: string;
  email_verified: string;
  name?: string;
  picture?: string;
}

export async function verifyGoogleToken(idToken: string): Promise<GoogleTokenPayload> {
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
  );

  if (!res.ok) {
    throw new Error("Invalid Google ID token");
  }

  const payload = (await res.json()) as GoogleTokenPayload & { aud: string };

  if (env.FURNIGO_GOOGLE_CLIENT_ID && payload.aud !== env.FURNIGO_GOOGLE_CLIENT_ID) {
    throw new Error("Google token audience mismatch");
  }

  if (payload.email_verified !== "true") {
    throw new Error("Google email not verified");
  }

  return payload;
}
