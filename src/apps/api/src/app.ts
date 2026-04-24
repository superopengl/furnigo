import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import { env } from "@furnigo/config";
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/users";
import { chatRoutes } from "./routes/chats";
import { messageRoutes } from "./routes/messages";
import { uploadRoutes } from "./routes/uploads";
import { setupSocket } from "./ws/setupSocket";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "development" ? "debug" : "info",
      base: undefined,
      formatters: {
        level: (label) => ({ level: label }),
      },
      timestamp: () => {
        const now = new Date();
        return `,"utc":"${now.toISOString()}","local":"${now.toLocaleString(undefined, { timeZoneName: "short" })}"`;
      },
    },
  });

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

  if (env.NODE_ENV === "development") {
    app.addHook("onRequest", async (request) => {
      app.log.debug(`→ ${request.method} ${request.url}`);
    });
    app.addHook("onSend", async (request, reply, payload) => {
      app.log.debug({ statusCode: reply.statusCode, body: payload }, `← ${request.method} ${request.url}`);
    });
  }

  await app.register(cors, { origin: true });
  await app.register(jwt, { secret: env.FURNIGO_API_AUTH_JWT_SECRET });
  await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });

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
  await app.register(uploadRoutes, { prefix: "/api/uploads" });

  app.get("/info", () => ({
    success: true,
    data: { routes, websocket: { path: "/ws", protocol: "socket.io" } },
  }));

  // WebSocket
  setupSocket(app);

  return app;
}
