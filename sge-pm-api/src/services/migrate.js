import { readdir, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { getPool } from "../db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "../../migrations");

async function ensureMigrationTable(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS sge_pm_schema_migrations (
      name VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getApplied(conn) {
  const [rows] = await conn.query("SELECT name FROM sge_pm_schema_migrations ORDER BY name");
  return new Set(rows.map((r) => r.name));
}

function splitStatements(sql) {
  return sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("--"));
}

export async function runMigrations() {
  const pool = getPool();
  const conn = await pool.getConnection();
  const applied = [];
  try {
    await ensureMigrationTable(conn);
    const done = await getApplied(conn);
    const files = (await readdir(migrationsDir))
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      if (done.has(file)) continue;
      const sql = await readFile(join(migrationsDir, file), "utf8");
      const statements = splitStatements(sql);
      await conn.beginTransaction();
      try {
        for (const stmt of statements) {
          await conn.query(stmt);
        }
        await conn.query("INSERT INTO sge_pm_schema_migrations (name) VALUES (?)", [file]);
        await conn.commit();
        applied.push(file);
      } catch (err) {
        await conn.rollback();
        throw err;
      }
    }
  } finally {
    conn.release();
  }
  return { applied };
}

export async function printMigrationStatus() {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await ensureMigrationTable(conn);
    const done = await getApplied(conn);
    const files = (await readdir(migrationsDir))
      .filter((f) => f.endsWith(".sql"))
      .sort();
    for (const file of files) {
      console.log(`${done.has(file) ? "[x]" : "[ ]"} ${file}`);
    }
  } finally {
    conn.release();
  }
}
