import "server-only";
import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;

// Supabase's Transaction Pooler multiplexes many clients over few backend
// connections and rotates the backend per statement, so server-side
// prepared statements (which are bound to one backend) are unsafe here —
// prepare must stay off. An explicit `sql.begin(...)` transaction still
// works: postgres.js pins one connection for the lifetime of that block.
function createClient(): Sql {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set — required for the guesthouse.enquiries DB layer.");
  }
  return postgres(url, {
    prepare: false,
    ssl: "require",
    idle_timeout: 20,
    max_lifetime: 60 * 30,
  });
}

// Reused across Next.js dev-server HMR reloads and warm serverless
// invocations, same pattern as the usual Prisma-singleton recipe.
const globalForSql = globalThis as unknown as { __guesthouseSql?: Sql };

/**
 * Lazily creates the Postgres.js client on first use — deliberately NOT
 * constructed at module-eval time. `next build` imports every route/page
 * module (including ones that are never executed) to collect metadata,
 * so an eager `postgres(url)` call at the top of this module would crash
 * the build whenever `DATABASE_URL` isn't set in the build environment.
 */
export function getSql(): Sql {
  if (!globalForSql.__guesthouseSql) {
    globalForSql.__guesthouseSql = createClient();
  }
  return globalForSql.__guesthouseSql;
}
