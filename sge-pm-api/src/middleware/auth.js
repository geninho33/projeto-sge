import { verifyToken } from "../services/authService.js";
import { queryOne } from "../db.js";

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
    user.perfisArr = user.perfis ? JSON.parse(user.perfis) : (user.perfil ? [user.perfil] : []);
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: { code: "INVALID_TOKEN", message: "Sessão expirada ou inválida" } });
  }
}

export function requirePerfil(...perfis) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ error: { code: "FORBIDDEN", message: "Sem permissão para esta ação" } });
    }
    const userPerfis = req.user.perfisArr || [req.user.perfil];
    const hasPermission = perfis.some((p) => userPerfis.includes(p));
    if (!hasPermission) {
      return res.status(403).json({ error: { code: "FORBIDDEN", message: "Sem permissão para esta ação" } });
    }
    next();
  };
}
