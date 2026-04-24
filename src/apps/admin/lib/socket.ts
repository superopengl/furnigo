import { io, Socket } from "socket.io-client";
import { getToken } from "./api";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket) return socket;

  const token = getToken();
  const wsUrl = typeof window !== "undefined" ? window.location.origin : "";

  socket = io(wsUrl, {
    path: "/ws",
    auth: { token },
    transports: ["websocket", "polling"],
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
