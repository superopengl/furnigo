import type { FastifyInstance } from "fastify";
import { db, chat, chatParticipant, message, user } from "@furnigo/db";
import { eq, desc, and } from "drizzle-orm";
import { getIO } from "../../ws/getIO";

export async function adminChatRoutes(app: FastifyInstance) {
  // Middleware: require agent or admin role
  app.addHook("onRequest", async (request, reply) => {
    await (app as any).authenticate(request, reply);
    const { role } = request.user as { id: string; role: string };
    if (role !== "agent" && role !== "admin") {
      return reply.code(403).send({
        success: false,
        error: { code: "FORBIDDEN", message: "Admin or agent role required" },
      });
    }
  });

  // List all chats with participants and last message
  app.get("/", async () => {
    const chats = await db
      .select()
      .from(chat)
      .orderBy(desc(chat.updatedAt));

    const enriched = await Promise.all(
      chats.map(async (c) => {
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
          .where(eq(chatParticipant.chatId, c.id));

        const [lastMessage] = await db
          .select()
          .from(message)
          .where(eq(message.chatId, c.id))
          .orderBy(desc(message.createdAt))
          .limit(1);

        return { ...c, participants, lastMessage: lastMessage ?? null };
      }),
    );

    return { success: true, data: enriched };
  });

  // Get chat detail — auto-join admin as agent if not a participant
  app.get("/:id", async (request) => {
    const { id: userId } = request.user as { id: string };
    const { id: chatId } = request.params as { id: string };

    const [found] = await db
      .select()
      .from(chat)
      .where(eq(chat.id, chatId))
      .limit(1);

    if (!found) {
      return { success: false, error: { code: "NOT_FOUND", message: "Chat not found" } };
    }

    // Auto-join admin as agent participant if not already
    const [existing] = await db
      .select()
      .from(chatParticipant)
      .where(and(eq(chatParticipant.chatId, chatId), eq(chatParticipant.userId, userId)))
      .limit(1);

    if (!existing) {
      await db.insert(chatParticipant).values({
        chatId,
        userId,
        role: "agent",
      });

      // Notify connected clients
      const io = getIO();
      if (io) {
        const [joined] = await db
          .select({ displayName: user.displayName, email: user.email })
          .from(user)
          .where(eq(user.id, userId))
          .limit(1);

        io.to(chatId).emit("participant:joined", {
          chatId,
          user: { userId, role: "agent", displayName: joined?.displayName, email: joined?.email },
        });
      }
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
      .select({
        senderId: message.senderId,
        senderRole: message.senderRole,
        contentType: message.contentType,
        content: message.content,
        label: message.label,
        createdAt: message.createdAt,
      })
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
}
