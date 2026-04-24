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

  let routes: { method: string; path: string }[] = [];
  app.addHook("onRoute", (routeOptions) => {
    const methods = Array.isArray(routeOptions.method) ? routeOptions.method : [routeOptions.method];
    routes = [
      ...routes,
      ...methods
        .filter((m) => m !== "HEAD" && m !== "OPTIONS")
        .map((method) => ({ method, path: routeOptions.url })),
    ];
  });

  await app.register(cors, { origin: true });
  await app.register(jwt, { secret: env.FURNIGO_API_AUTH_JWT_SECRET });

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
  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(userRoutes, { prefix: "/api/users" });
  await app.register(chatRoutes, { prefix: "/api/chats" });
  await app.register(messageRoutes, { prefix: "/api/chats" });

  app.get("/info", () => ({
    success: true,
    data: { routes, websocket: { path: "/ws", protocol: "socket.io" } },
  }));

  // WebSocket
  setupSocket(app);

  return app;
}
