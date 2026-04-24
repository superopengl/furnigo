import type { FastifyInstance } from "fastify";
import { readFile } from "fs/promises";
import { join } from "path";
import mime from "mime";
import { DEV_UPLOAD_DIR } from "@furnigo/config";

export async function devBlobRoutes(app: FastifyInstance) {
  app.get("/*", async (request, reply) => {
    const filePath = (request.params as { "*": string })["*"];

    if (filePath.includes("..")) {
      return reply.code(400).send({ success: false, error: { code: "BAD_REQUEST", message: "Invalid filePath" } });
    }

    try {
      const data = await readFile(join(DEV_UPLOAD_DIR, filePath));
      return reply.type(mime.getType(filePath) ?? "application/octet-stream").send(data);
    } catch {
      return reply.code(404).send({ success: false, error: { code: "NOT_FOUND", message: "File not found" } });
    }
  });
}
