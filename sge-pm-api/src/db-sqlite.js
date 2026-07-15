import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import { config } from "./config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
let db;

export function getSqlite() {
  if (!db) {
    const path = join(__dirname, "..", config.sqlitePath);
    mkdirSync(dirname(path), { recursive: true });
    db = new Database(path);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
  }
  return db;
}

export function sqliteQuery(sql, params = []) {
  const s = getSqlite();
  const trimmed = sql.trim().toUpperCase();
  if (trimmed.startsWith("SELECT") || trimmed.startsWith("WITH")) {
    return s.prepare(sql).all(...(Array.isArray(params) ? params : Object.values(params)));
  }
  if (trimmed.startsWith("INSERT") && sql.toUpperCase().includes("RETURNING")) {
    return s.prepare(sql).all(...(Array.isArray(params) ? params : Object.values(params)));
  }
  const info = s.prepare(sql).run(...(Array.isArray(params) ? params : Object.values(params)));
  return info;
}

/** Executa fn de forma síncrona dentro de uma transação SQLite (rollback automático em erro). */
export function sqliteTransaction(fn) {
  return getSqlite().transaction(fn)();
}

export function initSqliteSchema() {
  const s = getSqlite();
  s.exec(`
    CREATE TABLE IF NOT EXISTS sge_pm_schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sge_pm_projeto (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      data_inicio TEXT,
      data_fim_prevista TEXT,
      status TEXT DEFAULT 'planejamento',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sge_pm_usuario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      perfil TEXT NOT NULL,
      ativo INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS sge_pm_skill (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT UNIQUE NOT NULL,
      nome TEXT NOT NULL,
      lado TEXT NOT NULL,
      nivel_minimo TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sge_pm_usuario_skill (
      usuario_id INTEGER NOT NULL,
      skill_id INTEGER NOT NULL,
      nivel TEXT NOT NULL,
      PRIMARY KEY (usuario_id, skill_id),
      FOREIGN KEY (usuario_id) REFERENCES sge_pm_usuario(id) ON DELETE CASCADE,
      FOREIGN KEY (skill_id) REFERENCES sge_pm_skill(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sge_pm_backlog_item (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT UNIQUE NOT NULL,
      titulo TEXT NOT NULL,
      modulo TEXT,
      aspx_origem TEXT,
      url_origem TEXT,
      prioridade TEXT NOT NULL,
      tipo_tela TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      controles INTEGER DEFAULT 0,
      story_points INTEGER DEFAULT 1,
      screenshot_path TEXT,
      justificativa TEXT,
      status_geral TEXT DEFAULT 'backlog'
    );

    CREATE TABLE IF NOT EXISTS sge_pm_backlog_item_skill (
      backlog_item_id INTEGER NOT NULL,
      skill_id INTEGER NOT NULL,
      obrigatoria INTEGER DEFAULT 1,
      PRIMARY KEY (backlog_item_id, skill_id),
      FOREIGN KEY (backlog_item_id) REFERENCES sge_pm_backlog_item(id) ON DELETE CASCADE,
      FOREIGN KEY (skill_id) REFERENCES sge_pm_skill(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sge_pm_mapeamento_mudanca (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      backlog_item_id INTEGER UNIQUE NOT NULL,
      id_user_front INTEGER,
      id_user_back INTEGER,
      branch_front TEXT,
      branch_back TEXT,
      status_front TEXT DEFAULT 'nao_iniciado',
      status_back TEXT DEFAULT 'nao_iniciado',
      api_contract_path TEXT,
      pr_front_url TEXT,
      pr_back_url TEXT,
      merged_at TEXT,
      FOREIGN KEY (backlog_item_id) REFERENCES sge_pm_backlog_item(id) ON DELETE CASCADE,
      FOREIGN KEY (id_user_front) REFERENCES sge_pm_usuario(id) ON DELETE SET NULL,
      FOREIGN KEY (id_user_back) REFERENCES sge_pm_usuario(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS sge_pm_sprint (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projeto_id INTEGER NOT NULL,
      numero INTEGER NOT NULL,
      nome TEXT NOT NULL,
      data_inicio TEXT,
      data_fim TEXT,
      capacity_points INTEGER DEFAULT 40,
      status TEXT DEFAULT 'planejada',
      UNIQUE (projeto_id, numero),
      FOREIGN KEY (projeto_id) REFERENCES sge_pm_projeto(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sge_pm_sprint_backlog_item (
      sprint_id INTEGER NOT NULL,
      backlog_item_id INTEGER NOT NULL,
      story_points INTEGER NOT NULL,
      PRIMARY KEY (sprint_id, backlog_item_id),
      FOREIGN KEY (sprint_id) REFERENCES sge_pm_sprint(id) ON DELETE CASCADE,
      FOREIGN KEY (backlog_item_id) REFERENCES sge_pm_backlog_item(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sge_pm_usuario_projeto (
      projeto_id INTEGER NOT NULL,
      usuario_id INTEGER NOT NULL,
      papel TEXT DEFAULT 'membro',
      PRIMARY KEY (projeto_id, usuario_id),
      FOREIGN KEY (projeto_id) REFERENCES sge_pm_projeto(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES sge_pm_usuario(id) ON DELETE CASCADE
    );
  `);
}
