import { getSqlite } from "../db-sqlite.js";

const LEGACY_PROFILE_MAP = {
  gestor: "gestor_proj",
  tech_lead: "gestor_proj",
  dev_front: "desenvolvedor",
  dev_back: "desenvolvedor",
  qa: "homologador",
};

function normalizeProfileCode(code) {
  if (!code) return code;
  return LEGACY_PROFILE_MAP[code] || code;
}

export function applySchemaV7() {
  const s = getSqlite();
  const applied = s.prepare("SELECT 1 FROM sge_pm_schema_migrations WHERE name = '009_fix_user_profile_codes'").get();
  if (applied) return;

  const users = s.prepare("SELECT id, perfil, perfis FROM sge_pm_usuario WHERE deleted_at IS NULL").all();
  const insUP = s.prepare("INSERT OR IGNORE INTO sge_pm_usuario_perfil (usuario_id, perfil_id) VALUES (?, ?)");

  for (const u of users) {
    let perfis = [];
    try {
      perfis = u.perfis ? JSON.parse(u.perfis) : u.perfil ? [u.perfil] : [];
    } catch {
      perfis = u.perfil ? [u.perfil] : [];
    }
    perfis = [...new Set(perfis.map(normalizeProfileCode).filter(Boolean))];
    const perfilPrincipal = perfis[0] || normalizeProfileCode(u.perfil);

    s.prepare("UPDATE sge_pm_usuario SET perfil = ?, perfis = ? WHERE id = ?").run(
      perfilPrincipal,
      JSON.stringify(perfis),
      u.id
    );

    s.prepare("DELETE FROM sge_pm_usuario_perfil WHERE usuario_id = ?").run(u.id);
    for (const codigo of perfis) {
      const pf = s.prepare("SELECT id FROM sge_pm_perfil WHERE codigo = ?").get(codigo);
      if (pf) insUP.run(u.id, pf.id);
    }
  }

  s.prepare("INSERT INTO sge_pm_schema_migrations (name) VALUES ('009_fix_user_profile_codes')").run();
}
