import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { env } from "@furnigo/config";

const DEV_UPLOAD_DIR = join(process.cwd(), "uploadAttachments");

export async function storeFile(data: Buffer, originalFilename: string): Promise<string> {
  const fileId = randomUUID();

  if (env.NODE_ENV === "production") {
    // TODO: upload to cloud storage (e.g. Cloudflare R2)
    throw new Error("Production file storage not implemented");
  }

  await mkdir(DEV_UPLOAD_DIR, { recursive: true });
  await writeFile(join(DEV_UPLOAD_DIR, fileId, originalFilename), data);
  return fileId + '/' + originalFilename;
}
