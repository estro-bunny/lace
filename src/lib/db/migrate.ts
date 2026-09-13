import { readFileSync } from "fs";
import { join } from "path";
import { query, getClient } from "./pool";

const MIGRATIONS_DIR = join(__dirname, "migrations");

async function getAppliedMigrations(): Promise<string[]> {
  try {
    const { rows } = await query<{ name: string }>(
      "SELECT name FROM schema_migrations ORDER BY applied_at"
    );
    return rows.map((r) => r.name);
  } catch {
    // schema_migrations table doesn't exist yet
    return [];
  }
}

async function ensureMigrationsTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export async function migrate(): Promise<void> {
  const client = await getClient();
  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const { rows: applied } = await client.query<{ name: string }>(
      "SELECT name FROM schema_migrations ORDER BY name"
    );
    const appliedNames = new Set(applied.map((r) => r.name));

    const fs = await import("fs");
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      if (appliedNames.has(file)) continue;

      const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf-8");
      await client.query(sql);
      await client.query(
        "INSERT INTO schema_migrations (name) VALUES ($1)",
        [file]
      );
      console.log(`Applied migration: ${file}`);
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  migrate()
    .then(() => {
      console.log("Migrations complete");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}
