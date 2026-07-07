import { query } from "../db.js";
import { DEFAULT_PROFILE_PERMISSIONS, hasPermission, P } from "./menuPermissions.js";

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

function parsePerfisField(perfis, perfil) {
  if (Array.isArray(perfis)) return perfis;
  if (typeof perfis === "string" && perfis.trim()) {
    try {
      const parsed = JSON.parse(perfis);
      return Array.isArray(parsed) ? parsed : [perfil].filter(Boolean);
    } catch {
      return [perfil].filter(Boolean);
    }
  }
  return perfil ? [perfil] : [];
}

export async function enrichUser(user) {
  if (!user) return user;

  let perfisArr = await getUserProfileCodes(user.id);
  if (!perfisArr.length) {
    const legacy = parsePerfisField(user.perfis, user.perfil);
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

export function getProfileCodesFromUser(user) {
  if (user?.perfisArr?.length) {
    return [...new Set(user.perfisArr.map(normalizeProfileCode).filter(Boolean))];
  }
  return [...new Set(parsePerfisField(user?.perfis, user?.perfil).map(normalizeProfileCode).filter(Boolean))];
}

export function getEffectivePermissions(user) {
  const fromDb = user?.permissoes;
  if (fromDb && Object.keys(fromDb).length > 0) return fromDb;

  const merged = {};
  for (const code of getProfileCodesFromUser(user)) {
    const defaults = DEFAULT_PROFILE_PERMISSIONS[code];
    if (!defaults) continue;
    for (const [key, nivel] of Object.entries(defaults)) {
      merged[key] = Math.max(merged[key] ?? 0, nivel);
    }
  }
  return merged;
}

export function hasMenuPermission(user, menuKey, minLevel = 1) {
  return hasPermission(getEffectivePermissions(user), menuKey, minLevel);
}

export function isManagerUser(user) {
  const perfis = getProfileCodesFromUser(user);
  if (perfis.some((p) => ["gestor_proj", "admin"].includes(p))) return true;
  return hasMenuPermission(user, "admin_usuarios", P.VIEW)
    || hasMenuPermission(user, "admin_perfis", P.VIEW)
    || hasMenuPermission(user, "projetos", P.UPDATE);
}
