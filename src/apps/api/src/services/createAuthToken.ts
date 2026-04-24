import type { FastifyInstance } from "fastify";

const TOKEN_EXPIRY = "12h";

export function createAuthToken(app: FastifyInstance, payload: { id: string; role: string }) {
  return app.jwt.sign(payload, { expiresIn: TOKEN_EXPIRY });
}
