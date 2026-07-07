/**
 * Reset operacional: remove demandas, atividades, tarefas e apontamentos;
 * mantém apenas usuários Gestor e Eugênio; sincroniza permissões do menu.
 *
 * Uso: node scripts/resetAmbiente.mjs
 */
import { getSqlite } from "../src/db-sqlite.js";
import { DEFAULT_PROFILE_PERMISSIONS, flattenMenuKeys } from "../src/services/menuPermissions.js";

const KEEP_EMAILS = ["gestor@sge.local", "geninho33@gmail.com"];

async function exec(sql, params = []) {
  const s = getSqlite();
  return params.length ? s.prepare(sql).run(...params) : s.prepare(sql).run();
}

async function clearOperationalData() {
  const tables = [
    "sge_pm_timer_tarefa",
    "sge_pm_timer_ativo",
    "sge_pm_apontamento_tarefa",
    "sge_pm_apontamento_atividade",
    "sge_pm_apontamento",
    "sge_pm_tarefa_backlog",
    "sge_pm_tarefa_link",
    "sge_pm_atividade_tarefa",
    "sge_pm_atividade_backlog",
    "sge_pm_atividade_link",
    "sge_pm_atividade_anexo",
    "sge_pm_tramitacao",
    "sge_pm_atividade",
    "sge_pm_demanda_link",
    "sge_pm_demanda_anexo",
    "sge_pm_demanda",
  ];

  const s = getSqlite();
  s.exec("PRAGMA foreign_keys = OFF");
  for (const table of tables) {
    try {
      const r = s.prepare(`DELETE FROM ${table}`).run();
      console.log(`  ${table}: ${r.changes} removido(s)`);
    } catch (e) {
      console.log(`  ${table}: ignorado (${e.message})`);
    }
  }

  try {
    const r = s.prepare(`DELETE FROM sge_pm_comentario WHERE entidade_tipo IN ('demanda', 'atividade')`).run();
    console.log(`  sge_pm_comentario (demanda/atividade): ${r.changes} removido(s)`);
  } catch (e) {
    console.log(`  sge_pm_comentario: ${e.message}`);
  }

  try {
    const r = s.prepare(`DELETE FROM sge_pm_notificacao WHERE referencia_tipo IN ('demanda', 'atividade', 'tarefa')`).run();
    console.log(`  sge_pm_notificacao: ${r.changes} removido(s)`);
  } catch {
    /* opcional */
  }

  s.exec("PRAGMA foreign_keys = ON");
}

async function pruneUsers() {
  const s = getSqlite();
  const placeholders = KEEP_EMAILS.map(() => "?").join(", ");
  const removed = s
    .prepare(
      `SELECT id, nome, email FROM sge_pm_usuario
       WHERE lower(email) NOT IN (${placeholders}) AND deleted_at IS NULL`
    )
    .all(...KEEP_EMAILS.map((e) => e.toLowerCase()));

  for (const u of removed) {
    s.prepare(`DELETE FROM sge_pm_usuario_perfil WHERE usuario_id = ?`).run(u.id);
    s.prepare(`DELETE FROM sge_pm_usuario_skill WHERE usuario_id = ?`).run(u.id);
    s.prepare(
      `UPDATE sge_pm_usuario SET ativo = 0, deleted_at = datetime('now') WHERE id = ?`
    ).run(u.id);
    console.log(`  Usuário removido: ${u.nome} <${u.email}>`);
  }

  const kept = s
    .prepare(`SELECT id, nome, email, perfil FROM sge_pm_usuario WHERE deleted_at IS NULL AND ativo = 1`)
    .all();

  s.prepare(`UPDATE sge_pm_usuario SET nome = 'Gestor' WHERE lower(email) = 'gestor@sge.local'`).run();

  console.log("  Usuários ativos:", kept.map((u) => `${u.nome} (${u.email})`).join(", "));
}

async function syncProfilePermissions() {
  const s = getSqlite();
  const menuKeys = flattenMenuKeys();

  for (const [codigo, perms] of Object.entries(DEFAULT_PROFILE_PERMISSIONS)) {
    const perfil = s.prepare(`SELECT id FROM sge_pm_perfil WHERE codigo = ?`).get(codigo);
    if (!perfil) {
      console.warn(`  Perfil não encontrado: ${codigo}`);
      continue;
    }
    s.prepare(`DELETE FROM sge_pm_perfil_permissao WHERE perfil_id = ?`).run(perfil.id);
    const ins = s.prepare(
      `INSERT INTO sge_pm_perfil_permissao (perfil_id, menu_key, nivel) VALUES (?, ?, ?)`
    );
    for (const key of menuKeys) {
      ins.run(perfil.id, key, perms[key] ?? 0);
    }
    console.log(`  Permissões sincronizadas: ${codigo}`);
  }

  const map = { gestor: "gestor_proj", dev_front: "desenvolvedor" };
  const insUP = s.prepare(`INSERT OR REPLACE INTO sge_pm_usuario_perfil (usuario_id, perfil_id) VALUES (?, ?)`);
  const users = s
    .prepare(`SELECT id, email, perfil FROM sge_pm_usuario WHERE deleted_at IS NULL AND ativo = 1`)
    .all();

  for (const u of users) {
    const cod = map[u.perfil] || (u.email === "gestor@sge.local" ? "gestor_proj" : "desenvolvedor");
    const pf = s.prepare(`SELECT id FROM sge_pm_perfil WHERE codigo = ?`).get(cod);
    if (pf) {
      s.prepare(`DELETE FROM sge_pm_usuario_perfil WHERE usuario_id = ?`).run(u.id);
      insUP.run(u.id, pf.id);
      console.log(`  ${u.email} → perfil ${cod}`);
    }
  }
}

async function main() {
  console.log("Limpando dados operacionais...");
  await clearOperationalData();

  console.log("\n1) Removendo usuários extras (Gestor e Eugênio permanecem)...");
  await pruneUsers();

  console.log("\n2) Sincronizando permissões conforme menu...");
  await syncProfilePermissions();

  console.log("\nConcluído.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
