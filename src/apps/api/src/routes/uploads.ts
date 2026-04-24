import type { FastifyInstance } from "fastify";
import { readFile } from "fs/promises";
import { join } from "path";
import { storeFile, UPLOAD_DIR } from "../services/storeFile";

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  heic: "image/heic",
  pdf: "application/pdf",
};

export async function uploadRoutes(app: FastifyInstance) {
  app.post("/", { onRequest: [app.authenticate] }, async (request, reply) => {
    const file = await request.file();
    if (!file) {
      return reply.code(400).send({
        success: false,
        error: { code: "BAD_REQUEST", message: "No file uploaded" },
      });
    }

    const buffer = await file.toBuffer();
    const filename = await storeFile(buffer, file.filename);

    return { success: true, data: { url: `/api/uploads/${filename}` } };
  });

  app.get("/:filename", async (request, reply) => {
    const { filename } = request.params as { filename: string };

    if (filename.includes("..") || filename.includes("/")) {
      return reply.code(400).send({ success: false, error: { code: "BAD_REQUEST", message: "Invalid filename" } });
    }

    try {
      const data = await readFile(join(UPLOAD_DIR, filename));
      const ext = filename.split(".").pop()?.toLowerCase() ?? "";
      return reply.type(MIME_TYPES[ext] ?? "application/octet-stream").send(data);
    } catch {
      return reply.code(404).send({ success: false, error: { code: "NOT_FOUND", message: "File not found" } });
    }
  });
}
