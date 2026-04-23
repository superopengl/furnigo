import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@furnigo/config";

const connection = postgres(env.FURNIGO_OLTP_DATABASE_URL);

export const db = drizzle(connection);
