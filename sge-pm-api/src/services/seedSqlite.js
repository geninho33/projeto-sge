import { getSqlite, sqliteQuery } from "../db-sqlite.js";

const SKILLS = [
  ["SK-GX-01", "GeneXus 18 — Transactions/BC", "backend", "pleno"],
  ["SK-GX-02", "REST Services / OData exposure", "backend", "pleno"],
  ["SK-GX-03", "Refatoração WebPanel → API pura", "backend", "senior"],
  ["SK-GX-04", "Otimização SQL / Data Providers", "backend", "senior"],
  ["SK-GX-05", "Segurança API (GAM OAuth2/JWT)", "backend", "senior"],
  ["SK-FE-01", "React + componentização", "frontend", "pleno"],
  ["SK-FE-02", "Grids complexas (virtualização)", "frontend", "senior"],
  ["SK-FE-03", "State Management (Context/Redux)", "frontend", "pleno"],
  ["SK-FE-04", "Axios + interceptors auth", "frontend", "pleno"],
  ["SK-FE-05", "Formulários dinâmicos (schema-driven)", "frontend", "senior"],
  ["SK-PM-01", "Gestão ágil / backlog", "pm", "pleno"],
  ["SK-QA-01", "Testes E2E fluxos críticos", "qa", "pleno"],
];

export function seedSqliteIfEmpty() {
  const s = getSqlite();
  const [{ c }] = s.prepare("SELECT COUNT(*) AS c FROM sge_pm_projeto").all();
  if (c > 0) return;

  s.prepare(
    `INSERT INTO sge_pm_projeto (nome, descricao, data_inicio, status) VALUES (?, ?, date('now'), 'ativo')`
  ).run("Migração SGE Híbrida", "Migração de 115 telas GeneXus Web Forms para React + GeneXus REST");

  const insSkill = s.prepare(
    "INSERT INTO sge_pm_skill (codigo, nome, lado, nivel_minimo) VALUES (?, ?, ?, ?)"
  );
  for (const sk of SKILLS) insSkill.run(...sk);

  const users = [
    ["Gestor do Projeto", "gestor@sge.local", "Gestor de Projeto", "gestor"],
    ["Tech Lead", "techlead@sge.local", "Tech Lead", "tech_lead"],
    ["Dev Frontend Sênior", "devfront@sge.local", "Desenvolvedor Frontend", "dev_front"],
    ["Dev Backend GeneXus", "devback@sge.local", "Desenvolvedor GeneXus", "dev_back"],
    ["QA Pleno", "qa@sge.local", "Analista de QA", "qa"],
  ];
  const insUser = s.prepare("INSERT INTO sge_pm_usuario (nome, email, cargo, perfil) VALUES (?, ?, ?, ?)");
  for (const u of users) insUser.run(...u);

  const sprints = [
    [0, "Sprint 0 — Fundação PM", "ativa"],
    [1, "Sprint 1 — Onboarding P3", "planejada"],
    [2, "Sprint 2 — Cadastros base", "planejada"],
    [3, "Sprint 3 — Fluxos P1 menores", "planejada"],
  ];
  const insSprint = s.prepare(
    "INSERT INTO sge_pm_sprint (projeto_id, numero, nome, status, capacity_points) VALUES (1, ?, ?, ?, 40)"
  );
  for (const sp of sprints) insSprint.run(...sp);

  sqliteQuery("INSERT INTO sge_pm_schema_migrations (name) VALUES ('001_sqlite_seed')");
}
