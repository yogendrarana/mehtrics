import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";
import { serverEnv } from "@mehtrics/env";

const pool = new Pool({
  connectionString: serverEnv.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 10000,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// exports
export const db = drizzle(pool, {
  schema,
  logger: process.env.NODE_ENV === "development",
});

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
