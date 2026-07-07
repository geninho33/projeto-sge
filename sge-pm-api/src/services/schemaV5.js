import { getSqlite } from "../db-sqlite.js";

export function applySchemaV5() {
  const s = getSqlite();

  s.exec(`
    CREATE TABLE IF NOT EXISTS sge_pm_atividade_tarefa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      atividade_id INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      concluida INTEGER DEFAULT 0,
      ordem INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (atividade_id) REFERENCES sge_pm_atividade(id) ON DELETE CASCADE
    );
  `);

  const applied = s.prepare("SELECT 1 FROM sge_pm_schema_migrations WHERE name = '007_schema_v5_tarefas'").get();
  if (!applied) {
    s.prepare(`UPDATE sge_pm_atividade SET status = 'aguardando' WHERE status = 'pendente'`).run();
    s.prepare(`UPDATE sge_pm_atividade SET status = 'em_andamento' WHERE status = 'bloqueada'`).run();
    s.prepare("INSERT INTO sge_pm_schema_migrations (name) VALUES ('007_schema_v5_tarefas')").run();
  }
}
