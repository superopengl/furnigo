import type { FastifyInstance } from "fastify";
import mime from "mime";
import { env } from "@furnigo/config";
import { storeFile } from "../services/storeFile";

export async function uploadRoutes(app: FastifyInstance) {
  app.post("/", { onRequest: [app.authenticate] }, async (request, reply) => {
    const file = await request.file();
    if (!file) {
      return reply.code(400).send({
        success: false,
        error: { code: "BAD_REQUEST", message: "No file uploaded" },
      });
    }

    const detectedType = file.mimetype || mime.getType(file.filename) || "";
    if (!detectedType.startsWith("image/") && !detectedType.startsWith("video/") && detectedType !== "application/pdf") {
      return reply.code(400).send({
        success: false,
        error: { code: "BAD_REQUEST", message: "Only images, videos, and PDFs are allowed" },
      });
    }

    const buffer = await file.toBuffer();
    const filePathName = await storeFile(buffer, file.filename);

    return {
      success: true,
      data: {
        url: `${env.FURNIGO_BLOB_BASE_URL}/${filePathName}`,
        name: file.filename,
        size: buffer.length,
        contentType: file.mimetype || mime.getType(file.filename) || "application/octet-stream",
      },
    };
  });

}
