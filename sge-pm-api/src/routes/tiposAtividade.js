import { Router } from "express";
import { query, queryOne } from "../db.js";
import { logHistorico } from "../services/historico.js";
import { CORES_TIPO } from "../services/schemaV4.js";

const router = Router();

router.get("/cores", (_req, res) => {
  res.json({ data: CORES_TIPO });
});

router.get("/", async (req, res, next) => {
  try {
    const { q, ativo } = req.query;
    const where = ["1=1"];
    const params = [];
    if (ativo !== "all") { where.push("ativo = ?"); params.push(ativo === "0" ? 0 : 1); }
    if (q?.trim()) {
      where.push("(codigo LIKE ? OR nome LIKE ? OR descricao LIKE ?)");
      const t = `%${q.trim()}%`;
      params.push(t, t, t);
    }
    const rows = await query(`SELECT * FROM sge_pm_tipo_atividade WHERE ${where.join(" AND ")} ORDER BY nome`, params);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { codigo, nome, descricao, cor = "azul", icone, ativo = 1 } = req.body || {};
    if (!codigo?.trim() || !nome?.trim()) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Código e nome obrigatórios" } });
    }
    await query(
      `INSERT INTO sge_pm_tipo_atividade (codigo, nome, descricao, cor, icone, ativo) VALUES (?, ?, ?, ?, ?, ?)`,
      [codigo.trim().toUpperCase(), nome.trim(), descricao ?? null, cor, icone ?? null, ativo ? 1 : 0]
    );
    const created = await queryOne(`SELECT * FROM sge_pm_tipo_atividade ORDER BY id DESC LIMIT 1`);
    await logHistorico("tipo_atividade", created.id, req.user.id, "criado", req.body);
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const b = req.body || {};
    const fields = ["nome", "descricao", "cor", "icone", "ativo"];
    const sets = [];
    const params = [];
    for (const f of fields) {
      if (b[f] !== undefined) { sets.push(`${f} = ?`); params.push(f === "ativo" ? (b.ativo ? 1 : 0) : b[f]); }
    }
    if (!sets.length) return res.status(400).json({ error: { code: "VALIDATION_ERROR" } });
    params.push(req.params.id);
    await query(`UPDATE sge_pm_tipo_atividade SET ${sets.join(", ")} WHERE id = ?`, params);
    await logHistorico("tipo_atividade", req.params.id, req.user.id, "atualizado", b);
    const updated = await queryOne(`SELECT * FROM sge_pm_tipo_atividade WHERE id = ?`, [req.params.id]);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
