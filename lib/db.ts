// Minimal Postgres client (pg pool) — the durable backend when
// DATABASE_URL is present (Supabase). Takes priority over the Upstash Redis
// layer in store.ts / rateLimit.ts; without the env, nothing here activates
// and behavior is byte-identical to before.
//
// Vercel lambdas are IPv4-only in some configurations, so production should
// point at Supabase's session pooler (aws-0-<region>.pooler.supabase.com:5432,
// user postgres.<project-ref>) rather than the direct IPv6 db host.

import pg from "pg";
import { KVUnavailableError } from "./kv";

const URL = process.env.DATABASE_URL;

/** True when the Postgres layer is active. */
export const PG_ENABLED = Boolean(URL);

let pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!pool) {
    pool = new pg.Pool({
      connectionString: URL,
      // Supabase's pooler routes by SNI hostname — required, not optional.
      // Other hosts (direct db.*.supabase.co, plain Postgres) ignore it.
      ssl: URL.includes("pooler.supabase.com")
        ? { rejectUnauthorized: false }
        : { rejectUnauthorized: false, servername: new URL(URL).hostname },
      max: 3, // small: many warm lambda instances share one Postgres
      connectionTimeoutMillis: 10_000,
    });
  }
  return pool;
}

/**
 * Run `fn` with a pool client (for multi-statement transactions). Any failure
 * surfaces as KVUnavailableError — the "durable store unavailable" signal the
 * routes already fail loud on.
 */
export async function withClient<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  if (!URL) throw new KVUnavailableError("DATABASE_URL not configured");
  const client = await getPool().connect();
  try {
    return await fn(client);
  } catch (e) {
    throw new KVUnavailableError(`Postgres failure: ${String(e)}`);
  } finally {
    client.release();
  }
}

/** One statement, with the same error contract as withClient. */
export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<pg.QueryResult<T>> {
  return withClient((c) => c.query<T>(text, params));
}
