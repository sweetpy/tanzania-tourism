import { Pool, type PoolClient, type QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __waziPgPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __waziSchemaReady: Promise<void> | undefined;
}

function createPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) return null;

  // Railway private networking usually does not need SSL; public URLs often do.
  const needsSsl =
    /sslmode=require/i.test(connectionString) ||
    process.env.PGSSLMODE === "require" ||
    Boolean(process.env.DATABASE_SSL);

  return new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  });
}

export function getPool(): Pool | null {
  if (!process.env.DATABASE_URL?.trim()) return null;
  if (!globalThis.__waziPgPool) {
    globalThis.__waziPgPool = createPool() ?? undefined;
  }
  return globalThis.__waziPgPool ?? null;
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
);

CREATE TABLE IF NOT EXISTS partner_applications (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
);

CREATE INDEX IF NOT EXISTS enquiries_created_at_idx ON enquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS partner_applications_created_at_idx ON partner_applications (created_at DESC);
`;

export async function ensureSchema(): Promise<void> {
  const pool = getPool();
  if (!pool) return;

  if (!globalThis.__waziSchemaReady) {
    globalThis.__waziSchemaReady = (async () => {
      const client = await pool.connect();
      try {
        await client.query(SCHEMA_SQL);
      } finally {
        client.release();
      }
    })().catch((err) => {
      globalThis.__waziSchemaReady = undefined;
      throw err;
    });
  }

  await globalThis.__waziSchemaReady;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
) {
  await ensureSchema();
  const pool = getPool();
  if (!pool) throw new Error("DATABASE_URL is not configured");
  return pool.query<T>(text, params);
}

export async function withClient<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  await ensureSchema();
  const pool = getPool();
  if (!pool) throw new Error("DATABASE_URL is not configured");
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}
