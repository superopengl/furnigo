import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { env, DEV_UPLOAD_DIR } from "@furnigo/config";

export async function storeFile(data: Buffer, originalFilename: string): Promise<string> {
  const fileId = randomUUID();

  if (env.NODE_ENV === "production") {
    // TODO: upload to cloud storage (e.g. Cloudflare R2)
    throw new Error("Production file storage not implemented");
  }

  const dirPath = join(DEV_UPLOAD_DIR, fileId);
  await mkdir(dirPath, { recursive: true });
  await writeFile(join(dirPath, originalFilename), data);
  return fileId + '/' + originalFilename;
}
