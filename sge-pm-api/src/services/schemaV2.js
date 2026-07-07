import { getSqlite } from "../db-sqlite.js";

function hasColumn(s, table, column) {
  return s.pragma(`table_info(${table})`).some((c) => c.name === column);
}

function addColumn(s, table, column, definition) {
  if (!hasColumn(s, table, column)) {
    s.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

export function applySchemaV2() {
  const s = getSqlite();

  addColumn(s, "sge_pm_usuario", "senha_hash", "TEXT");
  addColumn(s, "sge_pm_usuario", "cargo", "TEXT");
  addColumn(s, "sge_pm_usuario", "created_at", "TEXT");
  addColumn(s, "sge_pm_usuario", "ultimo_acesso", "TEXT");
  addColumn(s, "sge_pm_usuario", "deleted_at", "TEXT");
  if (hasColumn(s, "sge_pm_usuario", "created_at")) {
    s.prepare("UPDATE sge_pm_usuario SET created_at = datetime('now') WHERE created_at IS NULL").run();
  }

  addColumn(s, "sge_pm_backlog_item", "descricao", "TEXT");
  addColumn(s, "sge_pm_backlog_item", "responsavel_id", "INTEGER");
  addColumn(s, "sge_pm_backlog_item", "projeto_id", "INTEGER DEFAULT 1");
  addColumn(s, "sge_pm_backlog_item", "sprint_id", "INTEGER");
  addColumn(s, "sge_pm_backlog_item", "prazo", "TEXT");
  addColumn(s, "sge_pm_backlog_item", "estimativa", "INTEGER");
  addColumn(s, "sge_pm_backlog_item", "criterios_aceite", "TEXT");
  addColumn(s, "sge_pm_backlog_item", "tags", "TEXT");
  addColumn(s, "sge_pm_backlog_item", "observacoes", "TEXT");
  addColumn(s, "sge_pm_backlog_item", "kanban_status", "TEXT DEFAULT 'backlog'");
  addColumn(s, "sge_pm_backlog_item", "created_at", "TEXT");
  addColumn(s, "sge_pm_backlog_item", "updated_at", "TEXT");
  if (hasColumn(s, "sge_pm_backlog_item", "created_at")) {
    s.prepare("UPDATE sge_pm_backlog_item SET created_at = datetime('now') WHERE created_at IS NULL").run();
    s.prepare("UPDATE sge_pm_backlog_item SET updated_at = datetime('now') WHERE updated_at IS NULL").run();
  }

  addColumn(s, "sge_pm_sprint", "objetivo", "TEXT");
  addColumn(s, "sge_pm_sprint", "responsavel_id", "INTEGER");
  addColumn(s, "sge_pm_sprint", "percentual_conclusao", "INTEGER DEFAULT 0");

  s.exec(`
    CREATE TABLE IF NOT EXISTS sge_pm_sprint_equipe (
      sprint_id INTEGER NOT NULL,
      usuario_id INTEGER NOT NULL,
      PRIMARY KEY (sprint_id, usuario_id),
      FOREIGN KEY (sprint_id) REFERENCES sge_pm_sprint(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES sge_pm_usuario(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sge_pm_demanda (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      backlog_item_id INTEGER,
      projeto_id INTEGER DEFAULT 1,
      sprint_id INTEGER,
      responsavel_id INTEGER,
      revisor_id INTEGER,
      homologador_id INTEGER,
      branch_nome TEXT,
      branch_tipo TEXT DEFAULT 'feature',
      branch_status TEXT DEFAULT 'aberta',
      repositorio TEXT,
      prazo TEXT,
      data_inicio TEXT,
      data_prevista_conclusao TEXT,
      prioridade TEXT DEFAULT 'media',
      situacao TEXT DEFAULT 'a_fazer',
      percentual_execucao INTEGER DEFAULT 0,
      ambiente TEXT DEFAULT 'desenvolvimento',
      observacoes TEXT,
      pr_url TEXT,
      branch_criada_em TEXT DEFAULT (datetime('now')),
      branch_merge_em TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (backlog_item_id) REFERENCES sge_pm_backlog_item(id) ON DELETE SET NULL,
      FOREIGN KEY (responsavel_id) REFERENCES sge_pm_usuario(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS sge_pm_migracao (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projeto_id INTEGER DEFAULT 1,
      sprint_id INTEGER,
      branch_nome TEXT,
      desenvolvedor_id INTEGER,
      funcionalidades TEXT,
      correcoes TEXT,
      scripts_db TEXT,
      alteracoes_config TEXT,
      observacoes TEXT,
      status_implantacao TEXT DEFAULT 'planejada',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (desenvolvedor_id) REFERENCES sge_pm_usuario(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS sge_pm_migracao_backlog (
      migracao_id INTEGER NOT NULL,
      backlog_item_id INTEGER NOT NULL,
      PRIMARY KEY (migracao_id, backlog_item_id),
      FOREIGN KEY (migracao_id) REFERENCES sge_pm_migracao(id) ON DELETE CASCADE,
      FOREIGN KEY (backlog_item_id) REFERENCES sge_pm_backlog_item(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sge_pm_historico (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entidade TEXT NOT NULL,
      entidade_id TEXT NOT NULL,
      usuario_id INTEGER,
      acao TEXT NOT NULL,
      detalhes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (usuario_id) REFERENCES sge_pm_usuario(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS sge_pm_auth_attempt (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      ip TEXT,
      sucesso INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  const applied = s.prepare("SELECT 1 FROM sge_pm_schema_migrations WHERE name = '004_schema_v2'").get();
  if (!applied) {
    s.prepare("UPDATE sge_pm_backlog_item SET kanban_status = 'backlog' WHERE kanban_status IS NULL").run();
    s.prepare(
      `UPDATE sge_pm_backlog_item SET kanban_status = 'concluido' WHERE status_geral = 'concluido'`
    ).run();
    s.prepare(
      `UPDATE sge_pm_backlog_item SET kanban_status = 'em_desenvolvimento' WHERE status_geral = 'em_andamento'`
    ).run();
    s.prepare("INSERT INTO sge_pm_schema_migrations (name) VALUES ('004_schema_v2')").run();
  }
}

export const KANBAN_COLUMNS = [
  "backlog",
  "a_fazer",
  "em_desenvolvimento",
  "em_revisao",
  "em_testes",
  "homologacao",
  "concluido",
];
