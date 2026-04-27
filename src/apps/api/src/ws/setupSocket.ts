import { Server } from "socket.io";
import type { FastifyInstance } from "fastify";
import { setIO } from "./getIO";

export function setupSocket(app: FastifyInstance) {
  const io = new Server(app.server, {
    cors: { origin: "*" },
    path: "/ws",
  });

  setIO(io);

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = app.jwt.verify<{ id: string; role: string }>(token as string);
      socket.data.userId = decoded.id;
      socket.data.role = decoded.role;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    app.log.info({ userId: socket.data.userId }, "WebSocket connected");

    // Auto-join admin/agent users to the "admin" room for broadcast notifications
    if (socket.data.role === "admin" || socket.data.role === "agent") {
      socket.join("admin");
    }

    socket.on("join", (chatId: string) => {
      socket.join(chatId);
    });

    socket.on("leave", (chatId: string) => {
      socket.leave(chatId);
    });

    socket.on("typing", (data: { chatId: string }) => {
      socket.to(data.chatId).emit("typing", {
        chatId: data.chatId,
        userId: socket.data.userId,
      });
    });

    socket.on("disconnect", () => {
      app.log.info({ userId: socket.data.userId }, "WebSocket disconnected");
    });
  });
}
