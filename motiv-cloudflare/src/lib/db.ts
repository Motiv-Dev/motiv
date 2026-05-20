import { getRequestContext } from "@cloudflare/next-on-pages";

/**
 * Get the D1 database binding from the Cloudflare request context.
 * This is async-compatible and works with Cloudflare Pages + Next.js.
 */
export function getDb(): D1Database {
  return (getRequestContext().env as any).DB;
}

/**
 * Async wrapper around D1 that mirrors the old better-sqlite3 API names
 * but with async/await. All callers must be updated to await these.
 */
export const db = {
  /** Execute a query and return all matching rows */
  async all<T = any>(query: string, ...params: any[]): Promise<T[]> {
    const d1 = getDb();
    const result = await d1.prepare(query).bind(...params).all<T>();
    return result.results;
  },

  /** Execute a query and return the first matching row (or null) */
  async get<T = any>(query: string, ...params: any[]): Promise<T | null> {
    const d1 = getDb();
    const result = await d1.prepare(query).bind(...params).first<T>();
    return result;
  },

  /** Execute a mutation (INSERT/UPDATE/DELETE) and return metadata */
  async run(query: string, ...params: any[]): Promise<D1Result> {
    const d1 = getDb();
    const result = await d1.prepare(query).bind(...params).run();
    return result;
  },

  /** Execute raw SQL (e.g., for DDL statements or multi-statement setup) */
  async exec(query: string): Promise<D1ExecResult> {
    const d1 = getDb();
    return d1.exec(query);
  },

  /**
   * Execute a batch of prepared statements atomically.
   * Useful for transactions.
   */
  async batch(statements: D1PreparedStatement[]): Promise<D1Result[]> {
    const d1 = getDb();
    return d1.batch(statements);
  },

  /** Get the raw D1 prepared statement for advanced usage */
  prepare(query: string) {
    const d1 = getDb();
    return d1.prepare(query);
  },
};

/**
 * Initialize the database schema.
 * For D1, this should be done via `wrangler d1 execute` with schema.sql.
 * This function is kept for compatibility but is a no-op on D1 —
 * schema is managed via migrations.
 *
 * For admin seeding, this can be called once on first deploy.
 */
export async function initDb(): Promise<void> {
  // Seed admin user from env vars if needed
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const existing = await db.get("SELECT id FROM admin_users WHERE email = ?", adminEmail);
    if (!existing) {
      const bcrypt = await import("bcryptjs");
      const hash = bcrypt.hashSync(adminPassword, 10);
      await db.run("INSERT INTO admin_users (email, password_hash) VALUES (?, ?)", adminEmail, hash);
    }
  }
}
