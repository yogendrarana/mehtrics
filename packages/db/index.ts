// Main package export
export { db, type Transaction } from "./src/client";
export * from "./src/schema";

// Re-export drizzle-orm operators for convenient single-import usage
export {
  eq,
  and,
  or,
  not,
  gt,
  lt,
  gte,
  lte,
  isNull,
  isNotNull,
  inArray,
  notInArray,
  count,
  sum,
  avg,
  min,
  max,
  desc,
  asc,
  sql,
} from "drizzle-orm";
