export type SenderRole = "client" | "agent" | "system";
export type ContentType = "text" | "image" | "attachment" | "video" | "tool";
export type MessageLabel = "order" | "action_required" | "payment" | "shipment" | "delivery";

export interface Message {
  id: string;
  chatId: string;
  senderId: string | null;
  senderRole: SenderRole;
  contentType: ContentType;
  content: Record<string, unknown>;
  label: MessageLabel[] | null;
  createdAt: string;
}
