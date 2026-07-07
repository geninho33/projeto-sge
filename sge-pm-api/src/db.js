import mysql from "mysql2/promise";
import { config } from "./config.js";
import { getSqlite, sqliteQuery, initSqliteSchema } from "./db-sqlite.js";

let pool;

export function useSqlite() {
  return config.dbDriver === "sqlite";
}

export function getPool() {
  if (!pool && !useSqlite()) {
    pool = mysql.createPool({
      ...config.mysql,
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true,
    });
  }
  return pool;
}

function toSqliteParams(sql, params) {
  if (!params) return { sql, arr: [] };
  if (Array.isArray(params)) {
    let i = 0;
    return { sql: sql.replace(/:(\w+)/g, () => `?`), arr: params };
  }
  const arr = [];
  const converted = sql.replace(/:(\w+)/g, (_, key) => {
    arr.push(params[key]);
    return "?";
  });
  return { sql: converted, arr };
}

export async function query(sql, params) {
  if (useSqlite()) {
    const { sql: q, arr } = toSqliteParams(sql, params);
    return sqliteQuery(q, arr);
  }
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

export async function queryOne(sql, params) {
  const rows = await query(sql, params);
  return rows[0] ?? null;
}

export async function initDb() {
  if (useSqlite()) {
    initSqliteSchema();
    const { applySchemaV2 } = await import("./services/schemaV2.js");
    applySchemaV2();
    const { applySchemaV3 } = await import("./services/schemaV3.js");
    applySchemaV3();
    const { applySchemaV4 } = await import("./services/schemaV4.js");
    applySchemaV4();
    const { applySchemaV5 } = await import("./services/schemaV5.js");
    applySchemaV5();
    const { applySchemaV6 } = await import("./services/schemaV6.js");
    applySchemaV6();
    const { applySchemaV7 } = await import("./services/schemaV7.js");
    applySchemaV7();
    const { seedSqliteIfEmpty } = await import("./services/seedSqlite.js");
    seedSqliteIfEmpty();
    const { ensureDefaultPasswords } = await import("./services/authService.js");
    await ensureDefaultPasswords();
    return;
  }
  const { runMigrations } = await import("./services/migrate.js");
  await runMigrations();
}
