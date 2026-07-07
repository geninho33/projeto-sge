import { Router } from "express";
import { query, queryOne } from "../db.js";
import { logHistorico } from "../services/historico.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { entidade_tipo, entidade_id } = req.query;
    if (!entidade_tipo || !entidade_id) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "entidade_tipo e entidade_id obrigatórios" } });
    }
    const rows = await query(
      `SELECT c.*, u.nome AS autor_nome FROM sge_pm_comentario c
       JOIN sge_pm_usuario u ON u.id = c.autor_id
       WHERE c.entidade_tipo = ? AND c.entidade_id = ?
       ORDER BY c.created_at`,
      [entidade_tipo, entidade_id]
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { entidade_tipo, entidade_id, parent_id, texto, mencoes } = req.body || {};
    if (!entidade_tipo || !entidade_id || !texto?.trim()) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Campos obrigatórios ausentes" } });
    }
    await query(
      `INSERT INTO sge_pm_comentario (entidade_tipo, entidade_id, parent_id, autor_id, texto, mencoes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [entidade_tipo, entidade_id, parent_id ?? null, req.user.id, texto.trim(), mencoes ? JSON.stringify(mencoes) : null]
    );
    if (entidade_tipo === "demanda") {
      await logHistorico("demanda", entidade_id, req.user.id, "comentario", { texto: texto.slice(0, 100) });
    }
    const created = await queryOne(`SELECT c.*, u.nome AS autor_nome FROM sge_pm_comentario c JOIN sge_pm_usuario u ON u.id = c.autor_id ORDER BY c.id DESC LIMIT 1`);
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
});

export default router;
