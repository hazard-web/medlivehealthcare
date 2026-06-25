import postgres from "postgres";

let sql: ReturnType<typeof postgres> | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

/** Server-only PostgreSQL client (Supabase pooler or direct connection). */
export function getSql() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add your Supabase PostgreSQL connection string to .env.local."
    );
  }
  if (!sql) {
    sql = postgres(url, {
      ssl: "require",
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return sql;
}
