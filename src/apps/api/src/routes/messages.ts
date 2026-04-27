import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db, message, chatParticipant } from "@furnigo/db";
import { eq, and, lt, gt, desc, asc } from "drizzle-orm";
import { getIO } from "../ws/getIO";

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
    const { cursor, after, limit: rawLimit } = request.query as { cursor?: string; after?: string; limit?: string };
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

    if (after) {
      // Forward cursor: get messages newer than `after`
      const messages = await db
        .select()
        .from(message)
        .where(and(eq(message.chatId, chatId), gt(message.createdAt, new Date(after))))
        .orderBy(asc(message.createdAt))
        .limit(limit);

      return {
        success: true,
        data: messages,
        meta: {
          limit,
          cursor: messages.length > 0 ? messages[messages.length - 1].createdAt.toISOString() : null,
        },
      };
    }

    // Backward cursor: get older messages (existing behavior)
    const conditions = [
      eq(message.chatId, chatId),
      ...(cursor ? [lt(message.createdAt, new Date(cursor))] : []),
    ];

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
        ...body,
        label: body.label ?? null,
      })
      .returning();

    // Broadcast via WebSocket
    const io = getIO();
    if (io) {
      io.to(chatId).emit("message:new", { chatId, message: newMessage });
      // Notify admin room so the chat list refreshes
      io.to("admin").emit("chat:updated", { chatId });
    }

    return { success: true, data: newMessage };
  });
}
