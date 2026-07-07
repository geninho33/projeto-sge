import { getSqlite } from "../db-sqlite.js";

function hasColumn(s, table, column) {
  return s.pragma(`table_info(${table})`).some((c) => c.name === column);
}

function addColumn(s, table, column, definition) {
  if (!hasColumn(s, table, column)) {
    s.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

export function applySchemaV6() {
  const s = getSqlite();

  addColumn(s, "sge_pm_atividade_tarefa", "status", "TEXT DEFAULT 'aguardando'");
  addColumn(s, "sge_pm_atividade_tarefa", "descricao", "TEXT");
  addColumn(s, "sge_pm_atividade_tarefa", "executor_id", "INTEGER");
  addColumn(s, "sge_pm_atividade_tarefa", "tipo_atividade_id", "INTEGER");
  addColumn(s, "sge_pm_atividade_tarefa", "data_prevista_termino", "TEXT");
  addColumn(s, "sge_pm_atividade_tarefa", "data_inicio", "TEXT");
  addColumn(s, "sge_pm_atividade_tarefa", "horas_pendentes", "REAL");
  addColumn(s, "sge_pm_atividade_tarefa", "prompt_ia", "TEXT");
  addColumn(s, "sge_pm_atividade_tarefa", "comando_branch", "TEXT");

  addColumn(s, "sge_pm_usuario", "perfis", "TEXT");
  addColumn(s, "sge_pm_usuario", "avatar_url", "TEXT");

  s.exec(`
    CREATE TABLE IF NOT EXISTS sge_pm_apontamento_tarefa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tarefa_id INTEGER NOT NULL,
      usuario_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      hora_inicio TEXT NOT NULL,
      hora_fim TEXT NOT NULL,
      duracao_minutos INTEGER NOT NULL,
      comentario TEXT,
      tipo TEXT DEFAULT 'manual',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (tarefa_id) REFERENCES sge_pm_atividade_tarefa(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES sge_pm_usuario(id)
    );

    CREATE TABLE IF NOT EXISTS sge_pm_timer_tarefa (
      usuario_id INTEGER PRIMARY KEY,
      tarefa_id INTEGER NOT NULL,
      atividade_id INTEGER NOT NULL,
      demanda_id INTEGER NOT NULL,
      iniciado_em TEXT,
      acumulado_segundos INTEGER DEFAULT 0,
      status TEXT DEFAULT 'paused',
      ultimo_heartbeat TEXT,
      FOREIGN KEY (tarefa_id) REFERENCES sge_pm_atividade_tarefa(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES sge_pm_usuario(id)
    );

    CREATE TABLE IF NOT EXISTS sge_pm_tarefa_backlog (
      tarefa_id INTEGER NOT NULL,
      backlog_item_id INTEGER NOT NULL,
      PRIMARY KEY (tarefa_id, backlog_item_id),
      FOREIGN KEY (tarefa_id) REFERENCES sge_pm_atividade_tarefa(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sge_pm_tarefa_link (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tarefa_id INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      url TEXT NOT NULL,
      FOREIGN KEY (tarefa_id) REFERENCES sge_pm_atividade_tarefa(id) ON DELETE CASCADE
    );
  `);

  const applied = s.prepare("SELECT 1 FROM sge_pm_schema_migrations WHERE name = '008_schema_v6_tarefas_apontamento'").get();
  if (!applied) {
    s.prepare(`
      UPDATE sge_pm_atividade_tarefa SET status = 'concluida' WHERE concluida = 1 AND (status IS NULL OR status = 'aguardando')
    `).run();
    s.prepare(`
      UPDATE sge_pm_atividade_tarefa SET status = 'aguardando' WHERE concluida = 0 AND status IS NULL
    `).run();
    s.prepare("INSERT INTO sge_pm_schema_migrations (name) VALUES ('008_schema_v6_tarefas_apontamento')").run();
  }
}
