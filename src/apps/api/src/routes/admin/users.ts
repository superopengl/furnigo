import type { FastifyInstance } from "fastify";
import { db, user } from "@furnigo/db";
import { ilike, and, eq } from "drizzle-orm";

export async function adminUserRoutes(app: FastifyInstance) {
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

  // Search users by email
  app.get("/search", async (request) => {
    const { q } = request.query as { q?: string };
    if (!q || q.trim().length < 2) {
      return { success: true, data: [] };
    }

    const results = await db
      .select({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role,
      })
      .from(user)
      .where(and(ilike(user.email, `%${q.trim()}%`), eq(user.isActive, true)))
      .limit(20);

    return { success: true, data: results };
  });
}
