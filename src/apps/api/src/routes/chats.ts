import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db, chat, chatParticipant, message, user } from "@furnigo/db";
import { eq, desc, and } from "drizzle-orm";
import { getIO } from "../ws/getIO";

const createSchema = z.object({
  title: z.string().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
});

const addParticipantSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["client", "agent"]),
});

export async function chatRoutes(app: FastifyInstance) {
  // List user's chats
  app.get("/", { onRequest: [app.authenticate] }, async (request) => {
    const { id } = request.user as { id: string };

    const rows = await db
      .select({
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        role: chatParticipant.role,
      })
      .from(chatParticipant)
      .innerJoin(chat, eq(chatParticipant.chatId, chat.id))
      .where(eq(chatParticipant.userId, id))
      .orderBy(desc(chat.updatedAt));

    // Ensure all fields are properly typed for the response
    return { 
      success: true, 
      data: rows.map(row => ({
        id: row.id,
        title: row.title,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        role: row.role
      })) 
    };
  });

  // Create new chat
  app.post("/", { onRequest: [app.authenticate] }, async (request) => {
    const { id } = request.user as { id: string };
    const body = createSchema.parse(request.body);

    const [newChat] = await db
      .insert(chat)
      .values({ title: body.title })
      .returning();

    await db.insert(chatParticipant).values({
      chatId: newChat.id,
      userId: id,
      role: "client",
    });

    return {
      success: true,
      data: {
        ...newChat,
        participants: [{ userId: id, role: "client" }],
      },
    };
  });

  // Update chat
  app.put("/:id", { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id: userId } = request.user as { id: string };
    const { id: chatId } = request.params as { id: string };
    const body = updateSchema.parse(request.body);

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

    const [updated] = await db
      .update(chat)
      .set(body)
      .where(eq(chat.id, chatId))
      .returning({ title: chat.title, updatedAt: chat.updatedAt });

    // Emit WebSocket event for updated chat
    const io = getIO();
    if (io) {
      // Broadcast to all participants in this chat
      io.to(chatId).emit("chat:titleUpdated", {
        chatId,
        title: updated.title,
      });
    }

    return { success: true, data: updated };
  });

  // Get chat by ID
  app.get("/:id", { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id: userId } = request.user as { id: string };
    const { id: chatId } = request.params as { id: string };

    // Verify user is a participant
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

    const [found] = await db
      .select()
      .from(chat)
      .where(eq(chat.id, chatId))
      .limit(1);

    if (!found) {
      return reply.code(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Chat not found" },
      });
    }

    const participants = await db
      .select({
        userId: chatParticipant.userId,
        role: chatParticipant.role,
        joinedAt: chatParticipant.joinedAt,
        displayName: user.displayName,
        email: user.email,
        avatarUrl: user.avatarUrl,
      })
      .from(chatParticipant)
      .innerJoin(user, eq(chatParticipant.userId, user.id))
      .where(eq(chatParticipant.chatId, chatId));

    const recentMessages = await db
      .select()
      .from(message)
      .where(eq(message.chatId, chatId))
      .orderBy(desc(message.createdAt))
      .limit(50);

    return {
      success: true,
      data: {
        ...found,
        participants,
        messages: recentMessages.reverse(),
      },
    };
  });

  // Add participant
  app.post("/:id/participants", { onRequest: [app.authenticate] }, async (request, reply) => {
    const { id: chatId } = request.params as { id: string };
    const body = addParticipantSchema.parse(request.body);

    const [existing] = await db
      .select()
      .from(chatParticipant)
      .where(and(eq(chatParticipant.chatId, chatId), eq(chatParticipant.userId, body.userId)))
      .limit(1);

    if (existing) {
      return reply.code(409).send({
        success: false,
        error: { code: "CONFLICT", message: "User is already a participant" },
      });
    }

    await db.insert(chatParticipant).values({ chatId, ...body });

    return { success: true, data: { chatId, ...body } };
  });
}
