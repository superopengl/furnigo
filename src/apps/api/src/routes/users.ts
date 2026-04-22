import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db, user } from "@furnigo/db";
import { eq } from "drizzle-orm";

const updateSchema = z.object({
  displayName: z.string().min(1).optional(),
  avatarUrl: z.string().url().optional(),
  locale: z.string().optional(),
});

export async function userRoutes(app: FastifyInstance) {
  app.get("/me", { onRequest: [app.authenticate] }, async (request) => {
    const { id } = request.user as { id: string };

    const [found] = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (!found) {
      return { success: false, error: { code: "NOT_FOUND", message: "User not found" } };
    }

    return { success: true, data: found };
  });

  app.put("/me", { onRequest: [app.authenticate] }, async (request) => {
    const { id } = request.user as { id: string };
    const body = updateSchema.parse(request.body);

    const [updated] = await db
      .update(user)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(user.id, id))
      .returning();

    return { success: true, data: updated };
  });
}
