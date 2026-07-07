import { query } from "../db.js";
import { hasPermission } from "./menuPermissions.js";

const LEGACY_PROFILE_MAP = {
  gestor: "gestor_proj",
  tech_lead: "gestor_proj",
  dev_front: "desenvolvedor",
  dev_back: "desenvolvedor",
  qa: "homologador",
};

export function normalizeProfileCode(code) {
  if (!code) return code;
  return LEGACY_PROFILE_MAP[code] || code;
}

export async function getUserProfileCodes(userId) {
  const rows = await query(
    `SELECT p.codigo
     FROM sge_pm_usuario_perfil up
     JOIN sge_pm_perfil p ON p.id = up.perfil_id AND p.ativo = 1
     WHERE up.usuario_id = ?
     ORDER BY p.nome`,
    [userId]
  );
  return rows.map((r) => r.codigo);
}

export async function getUserPermissions(userId) {
  const rows = await query(
    `SELECT pp.menu_key, MAX(pp.nivel) AS nivel
     FROM sge_pm_usuario_perfil up
     JOIN sge_pm_perfil p ON p.id = up.perfil_id AND p.ativo = 1
     JOIN sge_pm_perfil_permissao pp ON pp.perfil_id = p.id
     WHERE up.usuario_id = ?
     GROUP BY pp.menu_key`,
    [userId]
  );
  const map = {};
  for (const row of rows) map[row.menu_key] = row.nivel;
  return map;
}

async function getPermissionsByCodes(codes) {
  if (!codes.length) return {};
  const placeholders = codes.map(() => "?").join(", ");
  const rows = await query(
    `SELECT pp.menu_key, MAX(pp.nivel) AS nivel
     FROM sge_pm_perfil p
     JOIN sge_pm_perfil_permissao pp ON pp.perfil_id = p.id
     WHERE p.codigo IN (${placeholders}) AND p.ativo = 1
     GROUP BY pp.menu_key`,
    codes
  );
  const map = {};
  for (const row of rows) map[row.menu_key] = row.nivel;
  return map;
}

export async function syncUserProfiles(userId, profileCodes) {
  const codes = [...new Set((profileCodes || []).map(normalizeProfileCode).filter(Boolean))];
  await query(`DELETE FROM sge_pm_usuario_perfil WHERE usuario_id = ?`, [userId]);
  for (const codigo of codes) {
    const perfil = await query(
      `SELECT id FROM sge_pm_perfil WHERE codigo = ? AND ativo = 1`,
      [codigo]
    );
    if (perfil[0]?.id) {
      await query(
        `INSERT OR IGNORE INTO sge_pm_usuario_perfil (usuario_id, perfil_id) VALUES (?, ?)`,
        [userId, perfil[0].id]
      );
    }
  }
}

export async function enrichUser(user) {
  if (!user) return user;

  let perfisArr = await getUserProfileCodes(user.id);
  if (!perfisArr.length) {
    const legacy = user.perfis ? JSON.parse(user.perfis) : user.perfil ? [user.perfil] : [];
    perfisArr = [...new Set(legacy.map(normalizeProfileCode).filter(Boolean))];
    if (perfisArr.length) await syncUserProfiles(user.id, perfisArr);
  }

  user.perfisArr = perfisArr;
  user.perfil = perfisArr[0] || normalizeProfileCode(user.perfil);
  user.perfis = perfisArr;

  let permissoes = await getUserPermissions(user.id);
  if (!Object.keys(permissoes).length && perfisArr.length) {
    permissoes = await getPermissionsByCodes(perfisArr);
  }
  user.permissoes = permissoes;
  return user;
}

export function hasMenuPermission(user, menuKey, minLevel = 1) {
  return hasPermission(user?.permissoes, menuKey, minLevel);
}

export function isManagerUser(user) {
  if (hasMenuPermission(user, "admin_usuarios", 1)) return true;
  if (hasMenuPermission(user, "projetos", 3)) return true;
  const perfis = user?.perfisArr || [];
  return perfis.some((p) => ["gestor_proj", "admin"].includes(p));
}
