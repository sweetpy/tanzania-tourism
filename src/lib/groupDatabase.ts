import { Pool, type PoolClient, type QueryResultRow } from "pg";
let pool: Pool | undefined;
export async function closeGroupDatabase() {
  await pool?.end();
  pool = undefined;
}
function getGroupPool() {
  const connectionString = (
    process.env.BOKER_GROUP_DATABASE_URL || process.env.DATABASE_URL
  )?.trim();
  if (!connectionString)
    throw new Error("Group registration database is not configured");
  if (!pool)
    pool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      ...(/sslmode=require/.test(connectionString) ||
      process.env.PGSSLMODE === "require"
        ? { ssl: { rejectUnauthorized: true } }
        : {}),
    });
  return pool;
}
export function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  values?: unknown[],
) {
  return getGroupPool().query<T>(sql, values);
}
export async function withClient<T>(
  work: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getGroupPool().connect();
  try {
    return await work(client);
  } finally {
    client.release();
  }
}
