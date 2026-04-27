// WebSocket event names — keep in sync with mobile client

export const WS_EVENTS = {
  // Server → Client
  MESSAGE_NEW: "message:new",
  PARTICIPANT_JOINED: "participant:joined",
  TYPING: "typing",
  CHAT_UPDATED: "chat:updated",

  // Client → Server
  JOIN: "join",
  LEAVE: "leave",
  CLIENT_TYPING: "typing",
} as const;
