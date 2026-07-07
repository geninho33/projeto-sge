import { verifyToken } from "../services/authService.js";
import { queryOne } from "../db.js";
import { enrichUser, hasMenuPermission, normalizeProfileCode } from "../services/profileService.js";
import { P } from "../services/menuPermissions.js";

export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Sessão não autenticada" } });
  }
  try {
    const payload = verifyToken(header.slice(7));
    const user = await queryOne(
      `SELECT id, nome, email, perfil, perfis, cargo, ativo FROM sge_pm_usuario WHERE id = ? AND deleted_at IS NULL AND ativo = 1`,
      [payload.id]
    );
    if (!user) {
      return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Usuário inválido ou inativo" } });
    }
    await enrichUser(user);
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: { code: "INVALID_TOKEN", message: "Sessão expirada ou inválida" } });
  }
}

export function requirePerfil(...perfis) {
  const allowed = perfis.map(normalizeProfileCode);
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ error: { code: "FORBIDDEN", message: "Sem permissão para esta ação" } });
    }
    const userPerfis = (req.user.perfisArr || []).map(normalizeProfileCode);
    const hasAccess = allowed.some((p) => userPerfis.includes(p));
    if (!hasAccess) {
      return res.status(403).json({ error: { code: "FORBIDDEN", message: "Sem permissão para esta ação" } });
    }
    next();
  };
}

export function requireMenuPermissionByMethod(menuKey, overrides = {}) {
  const methodLevel = {
    GET: P.VIEW,
    HEAD: P.VIEW,
    POST: P.CREATE,
    PUT: P.UPDATE,
    PATCH: P.UPDATE,
    DELETE: P.DELETE,
    ...overrides,
  };
  return (req, res, next) => {
    const minLevel = methodLevel[req.method] ?? P.VIEW;
    return requireMenuPermission(menuKey, minLevel)(req, res, next);
  };
}

export function requireMenuPermission(menuKey, minLevel = 1) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ error: { code: "FORBIDDEN", message: "Acesso negado" } });
    }
    if (!hasMenuPermission(req.user, menuKey, minLevel)) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Você não tem permissão para esta ação",
          menuKey,
          requiredLevel: minLevel,
        },
      });
    }
    next();
  };
}
