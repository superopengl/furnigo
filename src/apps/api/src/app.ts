import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { env } from "@furnigo/config";
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/users";
import { chatRoutes } from "./routes/chats";
import { messageRoutes } from "./routes/messages";
import { setupSocket } from "./ws/handlers";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });
  await app.register(jwt, { secret: env.JWT_SECRET });

  // Auth decorator
  app.decorate("authenticate", async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.code(401).send({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } });
    }
  });

  app.get("/healthcheck", () => "OK");

  // Routes
  await app.register(authRoutes, { prefix: "/v1/auth" });
  await app.register(userRoutes, { prefix: "/v1/users" });
  await app.register(chatRoutes, { prefix: "/v1/chats" });
  await app.register(messageRoutes, { prefix: "/v1/chats" });

  // WebSocket
  setupSocket(app);

  return app;
}
