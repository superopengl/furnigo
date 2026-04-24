import { io, Socket } from "socket.io-client";
import { getToken } from "./api";

let socket: Socket | null = null;

// Connect directly to the API server — Next.js rewrites don't support WebSocket upgrades
const WS_URL = process.env.FURNIGO_WS_URL!;

export function connectSocket(): Socket | null {
  if (socket?.connected) return socket;
  // Clean up stale disconnected socket
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const token = getToken();
  if (!token) return null;

  socket = io(WS_URL, {
    path: "/ws",
    auth: { token },
    transports: ["websocket", "polling"],
  });

  return socket;
}

export function getSocket(): Socket {
  if (!socket) connectSocket();
  return socket!;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
