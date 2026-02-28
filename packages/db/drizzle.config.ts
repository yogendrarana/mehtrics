import { defineConfig } from "drizzle-kit";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

export default defineConfig({
  strict: true,
  verbose: true,
  dialect: "postgresql",
  out: "./src/migrations",
  schema: "./src/schema.ts",
  dbCredentials: {
    url: DATABASE_URL,
  },
  migrations: {
    schema: "public",
    table: "__migrations",
    prefix: "timestamp",
  },
});
