export type ParticipantRole = "client" | "agent";

export interface Chat {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatParticipant {
  chatId: string;
  userId: string;
  role: ParticipantRole;
  joinedAt: string;
  lastReadAt: string | null;
}
