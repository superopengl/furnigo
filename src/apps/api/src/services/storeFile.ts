import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { extname, join } from "path";

const UPLOAD_DIR = join(process.cwd(), "uploads");

export async function storeFile(data: Buffer, originalFilename: string): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = extname(originalFilename) || ".bin";
  const filename = `${randomUUID()}${ext}`;
  await writeFile(join(UPLOAD_DIR, filename), data);
  return filename;
}

export { UPLOAD_DIR };
