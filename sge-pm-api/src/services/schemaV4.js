import { getSqlite } from "../db-sqlite.js";

function hasColumn(s, table, column) {
  return s.pragma(`table_info(${table})`).some((c) => c.name === column);
}

function addColumn(s, table, column, definition) {
  if (!hasColumn(s, table, column)) {
    s.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

export const FASES_DEMANDA = [
  "criacao",
  "analise",
  "desenvolvimento",
  "homologacao",
  "aprovacao",
  "cancelada",
];

export const STATUS_PROJETO = [
  "planejamento",
  "em_andamento",
  "homologacao",
  "concluido",
  "cancelado",
];

export const CORES_TIPO = [
  { id: "azul", hex: "#1E6FD9", label: "Azul" },
  { id: "verde", hex: "#059669", label: "Verde" },
  { id: "vermelho", hex: "#DC2626", label: "Vermelho" },
  { id: "laranja", hex: "#D97706", label: "Laranja" },
  { id: "roxo", hex: "#7C3AED", label: "Roxo" },
  { id: "amarelo", hex: "#CA8A04", label: "Amarelo" },
  { id: "cinza", hex: "#64748B", label: "Cinza" },
  { id: "turquesa", hex: "#00D2FF", label: "Turquesa" },
];

export function applySchemaV4() {
  const s = getSqlite();

  addColumn(s, "sge_pm_projeto", "codigo", "TEXT");
  addColumn(s, "sge_pm_projeto", "cliente", "TEXT");
  addColumn(s, "sge_pm_projeto", "responsavel_id", "INTEGER");
  addColumn(s, "sge_pm_projeto", "cor", "TEXT DEFAULT '#1E6FD9'");
  addColumn(s, "sge_pm_projeto", "ativo", "INTEGER DEFAULT 1");
  addColumn(s, "sge_pm_projeto", "deleted_at", "TEXT");
  addColumn(s, "sge_pm_projeto", "updated_at", "TEXT");

  addColumn(s, "sge_pm_demanda", "fase", "TEXT DEFAULT 'criacao'");
  addColumn(s, "sge_pm_demanda", "solicitante_id", "INTEGER");
  addColumn(s, "sge_pm_demanda", "descricao_detalhada", "TEXT");
  addColumn(s, "sge_pm_demanda", "data_prevista_termino", "TEXT");
  addColumn(s, "sge_pm_demanda", "observacoes_demanda", "TEXT");
  addColumn(s, "sge_pm_demanda", "deleted_at", "TEXT");

  s.exec(`
    CREATE TABLE IF NOT EXISTS sge_pm_perfil (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT UNIQUE NOT NULL,
      nome TEXT NOT NULL,
      descricao TEXT,
      ativo INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sge_pm_perfil_permissao (
      perfil_id INTEGER NOT NULL,
      menu_key TEXT NOT NULL,
      nivel INTEGER DEFAULT 0,
      PRIMARY KEY (perfil_id, menu_key),
      FOREIGN KEY (perfil_id) REFERENCES sge_pm_perfil(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sge_pm_usuario_perfil (
      usuario_id INTEGER NOT NULL,
      perfil_id INTEGER NOT NULL,
      PRIMARY KEY (usuario_id, perfil_id),
      FOREIGN KEY (usuario_id) REFERENCES sge_pm_usuario(id) ON DELETE CASCADE,
      FOREIGN KEY (perfil_id) REFERENCES sge_pm_perfil(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sge_pm_tipo_atividade (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT UNIQUE NOT NULL,
      nome TEXT NOT NULL,
      descricao TEXT,
      cor TEXT DEFAULT 'azul',
      icone TEXT,
      ativo INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sge_pm_demanda_link (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      demanda_id INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      url TEXT NOT NULL,
      FOREIGN KEY (demanda_id) REFERENCES sge_pm_demanda(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sge_pm_demanda_anexo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      demanda_id INTEGER NOT NULL,
      nome_arquivo TEXT NOT NULL,
      caminho TEXT,
      tamanho INTEGER,
      uploaded_by INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (demanda_id) REFERENCES sge_pm_demanda(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sge_pm_atividade (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      demanda_id INTEGER NOT NULL,
      tipo_atividade_id INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      descricao TEXT,
      executor_id INTEGER,
      fase TEXT NOT NULL,
      status TEXT DEFAULT 'pendente',
      percentual_execucao INTEGER DEFAULT 0,
      horas_estimadas REAL DEFAULT 0,
      data_prevista_termino TEXT,
      observacoes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (demanda_id) REFERENCES sge_pm_demanda(id) ON DELETE CASCADE,
      FOREIGN KEY (tipo_atividade_id) REFERENCES sge_pm_tipo_atividade(id),
      FOREIGN KEY (executor_id) REFERENCES sge_pm_usuario(id)
    );

    CREATE TABLE IF NOT EXISTS sge_pm_atividade_backlog (
      atividade_id INTEGER NOT NULL,
      backlog_item_id INTEGER NOT NULL,
      PRIMARY KEY (atividade_id, backlog_item_id),
      FOREIGN KEY (atividade_id) REFERENCES sge_pm_atividade(id) ON DELETE CASCADE,
      FOREIGN KEY (backlog_item_id) REFERENCES sge_pm_backlog_item(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sge_pm_atividade_link (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      atividade_id INTEGER NOT NULL,
      titulo TEXT NOT NULL,
      url TEXT NOT NULL,
      FOREIGN KEY (atividade_id) REFERENCES sge_pm_atividade(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sge_pm_atividade_anexo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      atividade_id INTEGER NOT NULL,
      nome_arquivo TEXT NOT NULL,
      caminho TEXT,
      uploaded_by INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (atividade_id) REFERENCES sge_pm_atividade(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sge_pm_comentario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entidade_tipo TEXT NOT NULL,
      entidade_id INTEGER NOT NULL,
      parent_id INTEGER,
      autor_id INTEGER NOT NULL,
      texto TEXT NOT NULL,
      mencoes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (parent_id) REFERENCES sge_pm_comentario(id) ON DELETE SET NULL,
      FOREIGN KEY (autor_id) REFERENCES sge_pm_usuario(id)
    );

    CREATE TABLE IF NOT EXISTS sge_pm_tramitacao (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      demanda_id INTEGER NOT NULL,
      fase_anterior TEXT,
      fase_nova TEXT NOT NULL,
      comentario TEXT NOT NULL,
      usuario_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (demanda_id) REFERENCES sge_pm_demanda(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES sge_pm_usuario(id)
    );

    CREATE TABLE IF NOT EXISTS sge_pm_apontamento_atividade (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      atividade_id INTEGER NOT NULL,
      usuario_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      hora_inicio TEXT NOT NULL,
      hora_fim TEXT NOT NULL,
      duracao_minutos INTEGER NOT NULL,
      comentario TEXT,
      tipo TEXT DEFAULT 'manual',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (atividade_id) REFERENCES sge_pm_atividade(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES sge_pm_usuario(id)
    );
  `);

  const applied = s.prepare("SELECT 1 FROM sge_pm_schema_migrations WHERE name = '006_schema_v4_flow'").get();
  if (!applied) {
    seedV4(s);
    s.prepare("INSERT INTO sge_pm_schema_migrations (name) VALUES ('006_schema_v4_flow')").run();
  }
}

function seedV4(s) {
  const proj = s.prepare("SELECT id, codigo FROM sge_pm_projeto LIMIT 1").get();
  if (proj && !proj.codigo) {
    s.prepare("UPDATE sge_pm_projeto SET codigo = 'PRJ-0001', status = 'em_andamento', ativo = 1, cor = '#1E6FD9' WHERE id = ?").run(proj.id);
  }

  const perfis = [
    ["admin", "Administrador", "Acesso total ao sistema"],
    ["gestor_proj", "Gestor de Projetos", "Gestão de projetos, demandas e equipe"],
    ["analista", "Analista", "Análise e criação de demandas"],
    ["desenvolvedor", "Desenvolvedor", "Execução de atividades e apontamento"],
    ["homologador", "Homologador", "Homologação e aprovação"],
    ["consultor", "Usuário Consultor", "Somente consulta"],
  ];
  const insPerfil = s.prepare("INSERT OR IGNORE INTO sge_pm_perfil (codigo, nome, descricao) VALUES (?, ?, ?)");
  for (const p of perfis) insPerfil.run(...p);

  const tipos = [
    ["TA-ANL", "Análise", "Atividades de levantamento e análise", "azul", "📋"],
    ["TA-DEV", "Desenvolvimento", "Implementação técnica", "verde", "💻"],
    ["TA-TST", "Testes", "Testes e validação", "laranja", "🧪"],
    ["TA-DOC", "Documentação", "Documentação técnica", "cinza", "📄"],
    ["TA-HML", "Homologação", "Homologação com usuário", "roxo", "✅"],
  ];
  const insTipo = s.prepare("INSERT OR IGNORE INTO sge_pm_tipo_atividade (codigo, nome, descricao, cor, icone) VALUES (?, ?, ?, ?, ?)");
  for (const t of tipos) insTipo.run(...t);

  const adminPerfil = s.prepare("SELECT id FROM sge_pm_perfil WHERE codigo = 'admin'").get();
  if (adminPerfil) {
    const menus = [
      "dashboard", "minhas_demandas", "meu_kanban", "demandas", "projetos",
      "admin_perfis", "admin_tipos", "admin_usuarios", "admin_migracoes",
      "admin_mapeamento", "admin_skills", "kanban", "backlog", "sprints",
    ];
    const insPerm = s.prepare("INSERT OR IGNORE INTO sge_pm_perfil_permissao (perfil_id, menu_key, nivel) VALUES (?, ?, 6)");
    for (const m of menus) insPerm.run(adminPerfil.id, m);
  }

  const usuarios = s.prepare("SELECT id, perfil FROM sge_pm_usuario WHERE ativo = 1").all();
  const perfilMap = {
    gestor: "gestor_proj",
    tech_lead: "gestor_proj",
    dev_front: "desenvolvedor",
    dev_back: "desenvolvedor",
    qa: "homologador",
  };
  const insUP = s.prepare("INSERT OR IGNORE INTO sge_pm_usuario_perfil (usuario_id, perfil_id) VALUES (?, ?)");
  for (const u of usuarios) {
    const cod = perfilMap[u.perfil] || "consultor";
    const pf = s.prepare("SELECT id FROM sge_pm_perfil WHERE codigo = ?").get(cod);
    if (pf) insUP.run(u.id, pf.id);
  }
}
