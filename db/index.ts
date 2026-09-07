import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  const runtimeEnv = (globalThis as { env?: { DB?: unknown } }).env ?? process.env;
  const dbBinding = runtimeEnv?.DB;

  if (!dbBinding) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or inject the binding in the runtime before using the database."
    );
  }

  return drizzle(dbBinding as any, { schema });
}
