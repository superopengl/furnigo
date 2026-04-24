import type { FastifyInstance } from "fastify";
import { readFile } from "fs/promises";
import { join } from "path";
import mime from "mime";

const DEV_UPLOAD_DIR = join(process.cwd(), "uploadAttachments");

export async function devBlobRoutes(app: FastifyInstance) {
  app.get("/:fileId", async (request, reply) => {
    const { fileId } = request.params as { fileId: string };

    if (fileId.includes("..") || fileId.includes("/")) {
      return reply.code(400).send({ success: false, error: { code: "BAD_REQUEST", message: "Invalid fileId" } });
    }

    try {
      const data = await readFile(join(DEV_UPLOAD_DIR, fileId));
      return reply.type(mime.getType(fileId) ?? "application/octet-stream").send(data);
    } catch {
      return reply.code(404).send({ success: false, error: { code: "NOT_FOUND", message: "File not found" } });
    }
  });
}
