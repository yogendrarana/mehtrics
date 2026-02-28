import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const DATABASE_URL = process.env["DATABASE_URL"];

if (!DATABASE_URL) {
  throw new Error(
    "[packages/db] DATABASE_URL environment variable is not set. " +
      "Make sure you have a .env file or the variable is set in your environment.",
  );
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 10000,
  ssl:
    process.env["NODE_ENV"] === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// exports

export const db = drizzle(pool, {
  schema,
  logger: process.env["NODE_ENV"] === "development",
});

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
