import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db, message, chatParticipant } from "@furnigo/db";
import { eq, and, lt, desc } from "drizzle-orm";
import { getIO } from "../ws/handlers";

const sendSchema = z.object({
  contentType: z.enum(["text", "image", "attachment", "video", "tool"]),
  content: z.record(z.unknown()),
  label: z.array(z.enum(["order", "action_required", "payment", "shipment", "delivery"])).optional(),
});

export async function messageRoutes(app: FastifyInstance) {
  // Get messages (cursor-based pagination)
  app.get("/:id/messages", { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id: userId } = request.user as { id: string };
    const { id: chatId } = request.params as { id: string };
    const { cursor, limit: rawLimit } = request.query as { cursor?: string; limit?: string };
    const limit = Math.min(parseInt(rawLimit || "50", 10), 100);

    // Verify participant
    const [participant] = await db
      .select()
      .from(chatParticipant)
      .where(and(eq(chatParticipant.chatId, chatId), eq(chatParticipant.userId, userId)))
      .limit(1);

    if (!participant) {
      return reply.code(403).send({
        success: false,
        error: { code: "FORBIDDEN", message: "Not a participant of this chat" },
      });
    }

    const conditions = [eq(message.chatId, chatId)];
    if (cursor) {
      conditions.push(lt(message.createdAt, new Date(cursor)));
    }

    const messages = await db
      .select()
      .from(message)
      .where(and(...conditions))
      .orderBy(desc(message.createdAt))
      .limit(limit);

    return {
      success: true,
      data: messages.reverse(),
      meta: {
        limit,
        cursor: messages.length > 0 ? messages[0].createdAt.toISOString() : null,
      },
    };
  });

  // Send a message
  app.post("/:id/messages", { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id: userId } = request.user as { id: string };
    const { id: chatId } = request.params as { id: string };
    const body = sendSchema.parse(request.body);

    // Verify participant and get role
    const [participant] = await db
      .select()
      .from(chatParticipant)
      .where(and(eq(chatParticipant.chatId, chatId), eq(chatParticipant.userId, userId)))
      .limit(1);

    if (!participant) {
      return reply.code(403).send({
        success: false,
        error: { code: "FORBIDDEN", message: "Not a participant of this chat" },
      });
    }

    const [newMessage] = await db
      .insert(message)
      .values({
        chatId,
        senderId: userId,
        senderRole: participant.role,
        contentType: body.contentType,
        content: body.content,
        label: body.label ?? null,
      })
      .returning();

    // Broadcast via WebSocket
    const io = getIO();
    if (io) {
      io.to(chatId).emit("message:new", { chatId, message: newMessage });
    }

    return { success: true, data: newMessage };
  });
}
