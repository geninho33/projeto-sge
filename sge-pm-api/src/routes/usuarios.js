import { Router } from "express";
import { existsSync, mkdirSync } from "fs";
import { join, extname } from "path";
import multer from "multer";
import { query, queryOne } from "../db.js";
import { hashPassword } from "../services/authService.js";
import { logHistorico, getHistorico } from "../services/historico.js";
import { requirePerfil } from "../middleware/auth.js";
import { syncUserProfiles, normalizeProfileCode } from "../services/profileService.js";

const router = Router();

const AVATARS_DIR = join(process.cwd(), "public", "avatars");
if (!existsSync(AVATARS_DIR)) mkdirSync(AVATARS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, AVATARS_DIR),
  filename: (_, file, cb) => {
    const ext = extname(file.originalname) || ".png";
    cb(null, `avatar-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

const USER_FIELDS = "id, nome, email, cargo, perfil, perfis, avatar_url, ativo, created_at, ultimo_acesso";

function parseUser(row) {
  if (!row) return row;
  const perfis = row.perfis ? JSON.parse(row.perfis) : (row.perfil ? [row.perfil] : []);
  row.perfis = perfis.map(normalizeProfileCode);
  row.perfil = row.perfis[0] || normalizeProfileCode(row.perfil);
  return row;
}

router.get("/", async (req, res, next) => {
  try {
    const { q, perfil, ativo, incluir_inativos } = req.query;
    const where = ["deleted_at IS NULL"];
    const params = [];

    if (incluir_inativos !== "true") where.push("ativo = 1");
    if (perfil) {
      where.push("perfil = ?");
      params.push(perfil);
    }
    if (ativo === "0") {
      where.pop();
      where.push("ativo = 0");
    }
    if (q) {
      where.push("(nome LIKE ? OR email LIKE ? OR cargo LIKE ?)");
      const term = `%${q}%`;
      params.push(term, term, term);
    }

    const rows = await query(
      `SELECT ${USER_FIELDS} FROM sge_pm_usuario WHERE ${where.join(" AND ")} ORDER BY nome`,
      params
    );
    rows.forEach(parseUser);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const row = await queryOne(
      `SELECT ${USER_FIELDS} FROM sge_pm_usuario WHERE id = ? AND deleted_at IS NULL`,
      [req.params.id]
    );
    if (!row) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Usuário não encontrado" } });
    parseUser(row);
    res.json({ data: row });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/historico", async (req, res, next) => {
  try {
    const rows = await getHistorico("usuario", req.params.id);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.post("/", requirePerfil("gestor_proj", "admin"), async (req, res, next) => {
  try {
    const { nome, email, senha, cargo, perfil, perfis } = req.body || {};
    if (!nome?.trim() || !email?.trim()) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Nome e e-mail são obrigatórios" } });
    }
    const perfisArr = (Array.isArray(perfis) && perfis.length ? perfis : perfil ? [perfil] : ["desenvolvedor"])
      .map(normalizeProfileCode);
    const perfilPrincipal = perfisArr[0];
    const perfisJson = JSON.stringify(perfisArr);
    const hash = await hashPassword(senha || "Sge@2026");
    await query(
      `INSERT INTO sge_pm_usuario (nome, email, senha_hash, cargo, perfil, perfis, ativo) VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [nome.trim(), email.trim().toLowerCase(), hash, cargo ?? null, perfilPrincipal, perfisJson]
    );
    const created = await queryOne(`SELECT ${USER_FIELDS} FROM sge_pm_usuario WHERE lower(email) = ?`, [
      email.trim().toLowerCase(),
    ]);
    await syncUserProfiles(created.id, perfisArr);
    parseUser(created);
    await logHistorico("usuario", created.id, req.user.id, "criado", { nome, email, perfil: perfilPrincipal, perfis: created.perfis });
    res.status(201).json({ data: created });
  } catch (err) {
    if (err.message?.includes("UNIQUE")) {
      return res.status(409).json({ error: { code: "DUPLICATE", message: "E-mail já cadastrado" } });
    }
    next(err);
  }
});

router.put("/:id", requirePerfil("gestor_proj", "admin"), async (req, res, next) => {
  try {
    const { nome, email, cargo, perfil, perfis, senha, ativo } = req.body || {};
    const existing = await queryOne(`SELECT * FROM sge_pm_usuario WHERE id = ? AND deleted_at IS NULL`, [req.params.id]);
    if (!existing) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Usuário não encontrado" } });

    const updates = [];
    const params = [];
    if (nome) { updates.push("nome = ?"); params.push(nome.trim()); }
    if (email) { updates.push("email = ?"); params.push(email.trim().toLowerCase()); }
    if (cargo !== undefined) { updates.push("cargo = ?"); params.push(cargo); }
    if (perfil) { updates.push("perfil = ?"); params.push(normalizeProfileCode(perfil)); }
    if (Array.isArray(perfis)) {
      const perfisNorm = perfis.map(normalizeProfileCode);
      updates.push("perfis = ?");
      params.push(JSON.stringify(perfisNorm));
      if (!perfil && perfisNorm.length) { updates.push("perfil = ?"); params.push(perfisNorm[0]); }
    }
    if (ativo !== undefined) { updates.push("ativo = ?"); params.push(ativo ? 1 : 0); }
    if (senha) {
      updates.push("senha_hash = ?");
      params.push(await hashPassword(senha));
    }
    if (!updates.length) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Nada para atualizar" } });

    params.push(req.params.id);
    await query(`UPDATE sge_pm_usuario SET ${updates.join(", ")} WHERE id = ?`, params);
    const updated = await queryOne(`SELECT ${USER_FIELDS} FROM sge_pm_usuario WHERE id = ?`, [req.params.id]);
    const perfisToSync = Array.isArray(perfis)
      ? perfis.map(normalizeProfileCode)
      : updated.perfis
        ? JSON.parse(updated.perfis)
        : updated.perfil
          ? [updated.perfil]
          : [];
    if (perfisToSync.length) await syncUserProfiles(req.params.id, perfisToSync);
    await logHistorico("usuario", req.params.id, req.user.id, "atualizado", req.body);
    parseUser(updated);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/avatar", upload.single("avatar"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Nenhum arquivo enviado" } });
    const avatarUrl = `/avatars/${req.file.filename}`;
    await query(`UPDATE sge_pm_usuario SET avatar_url = ? WHERE id = ?`, [avatarUrl, req.params.id]);
    res.json({ data: { avatar_url: avatarUrl } });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/ativar", requirePerfil("gestor_proj", "admin"), async (req, res, next) => {
  try {
    const { ativo } = req.body;
    await query(`UPDATE sge_pm_usuario SET ativo = ? WHERE id = ? AND deleted_at IS NULL`, [ativo ? 1 : 0, req.params.id]);
    await logHistorico("usuario", req.params.id, req.user.id, ativo ? "ativado" : "inativado");
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requirePerfil("gestor_proj", "admin"), async (req, res, next) => {
  try {
    await query(`UPDATE sge_pm_usuario SET deleted_at = datetime('now'), ativo = 0 WHERE id = ?`, [req.params.id]);
    await logHistorico("usuario", req.params.id, req.user.id, "exclusao_logica");
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
