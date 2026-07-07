import { getSqlite } from "../db-sqlite.js";

function hasColumn(s, table, column) {
  return s.pragma(`table_info(${table})`).some((c) => c.name === column);
}

function addColumn(s, table, column, definition) {
  if (!hasColumn(s, table, column)) {
    s.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

export const SITUACOES_TRABALHO = [
  "nao_iniciada",
  "em_andamento",
  "aguardando_revisao",
  "bloqueada",
  "concluida",
];

export function applySchemaV3() {
  const s = getSqlite();

  addColumn(s, "sge_pm_demanda", "codigo", "TEXT");
  addColumn(s, "sge_pm_demanda", "descricao", "TEXT");
  addColumn(s, "sge_pm_demanda", "horas_estimadas", "REAL DEFAULT 0");
  addColumn(s, "sge_pm_demanda", "situacao_trabalho", "TEXT DEFAULT 'nao_iniciada'");
  addColumn(s, "sge_pm_demanda", "comentarios_tecnicos", "TEXT");
  addColumn(s, "sge_pm_demanda", "impedimentos", "TEXT");
  addColumn(s, "sge_pm_demanda", "proximos_passos", "TEXT");

  s.exec(`
    CREATE TABLE IF NOT EXISTS sge_pm_apontamento (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      demanda_id INTEGER NOT NULL,
      usuario_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      hora_inicio TEXT NOT NULL,
      hora_fim TEXT NOT NULL,
      duracao_minutos INTEGER NOT NULL,
      comentario TEXT,
      tipo TEXT DEFAULT 'manual',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (demanda_id) REFERENCES sge_pm_demanda(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES sge_pm_usuario(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sge_pm_timer_ativo (
      usuario_id INTEGER PRIMARY KEY,
      demanda_id INTEGER NOT NULL,
      iniciado_em TEXT NOT NULL,
      acumulado_segundos INTEGER DEFAULT 0,
      status TEXT DEFAULT 'running',
      ultimo_heartbeat TEXT,
      FOREIGN KEY (demanda_id) REFERENCES sge_pm_demanda(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES sge_pm_usuario(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sge_pm_notificacao (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      tipo TEXT NOT NULL,
      titulo TEXT NOT NULL,
      mensagem TEXT,
      lida INTEGER DEFAULT 0,
      referencia_tipo TEXT,
      referencia_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (usuario_id) REFERENCES sge_pm_usuario(id) ON DELETE CASCADE
    );
  `);

  const applied = s.prepare("SELECT 1 FROM sge_pm_schema_migrations WHERE name = '005_schema_v3_16flow'").get();
  if (!applied) {
    const rows = s.prepare("SELECT id FROM sge_pm_demanda WHERE codigo IS NULL").all();
    for (const row of rows) {
      const codigo = `DEM-${String(row.id).padStart(4, "0")}`;
      s.prepare("UPDATE sge_pm_demanda SET codigo = ? WHERE id = ?").run(codigo, row.id);
    }
    s.prepare("UPDATE sge_pm_demanda SET situacao_trabalho = 'nao_iniciada' WHERE situacao_trabalho IS NULL").run();
    s.prepare("INSERT INTO sge_pm_schema_migrations (name) VALUES ('005_schema_v3_16flow')").run();
  }
  seedDemandasExemplo(s);
}

function seedDemandasExemplo(s) {
  const count = s.prepare("SELECT COUNT(*) AS c FROM sge_pm_demanda").get().c;
  if (count > 0) return;

  const users = s.prepare("SELECT id, perfil FROM sge_pm_usuario").all();
  const devFront = users.find((u) => u.perfil === "dev_front")?.id;
  const devBack = users.find((u) => u.perfil === "dev_back")?.id;
  const qa = users.find((u) => u.perfil === "qa")?.id;
  const sprint = s.prepare("SELECT id FROM sge_pm_sprint WHERE numero = 1").get()?.id;

  const ins = s.prepare(`
    INSERT INTO sge_pm_demanda (codigo, titulo, descricao, projeto_id, sprint_id, responsavel_id,
      prioridade, situacao_trabalho, percentual_execucao, horas_estimadas, data_inicio, prazo)
    VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?, date('now'), date('now', '+14 days'))
  `);

  const samples = [
    ["DEM-0001", "Migrar tela de Bairros", "Implementar grid React com paginação server-side", sprint, devFront, "alta", "em_andamento", 45, 16],
    ["DEM-0002", "API REST Estados", "Expor endpoint OData para cadastro de estados", sprint, devBack, "alta", "nao_iniciada", 0, 12],
    ["DEM-0003", "Testes E2E Sprint 1", "Cobrir fluxos críticos de onboarding", sprint, qa, "media", "nao_iniciada", 0, 8],
    ["DEM-0004", "Componente DataGrid compartilhado", "Padronizar grid no pacote sge-ui", sprint, devFront, "media", "aguardando_revisao", 80, 10],
  ];

  for (const row of samples) ins.run(...row);
}
