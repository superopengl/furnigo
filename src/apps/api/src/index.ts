import { env } from "@furnigo/config";
import { buildApp } from "./app";

async function main() {
  console.log("Environment variables:");
  for (const [key, value] of Object.entries(env)) {
    console.log(`  ${key}=${value}`);
  }

  const app = await buildApp();

  await app.listen({ port: env.FURNIGO_API_SERVICE_PORT, host: "0.0.0.0" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
