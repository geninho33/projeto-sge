import { Router } from "express";
import { query, queryOne } from "../db.js";
import { logHistorico, getHistorico } from "../services/historico.js";
import { STATUS_PROJETO } from "../services/schemaV4.js";
import { requireMenuPermission } from "../middleware/auth.js";
import { P } from "../services/menuPermissions.js";

const router = Router();

const SELECT = `
  SELECT p.*, u.nome AS responsavel_nome
  FROM sge_pm_projeto p
  LEFT JOIN sge_pm_usuario u ON u.id = p.responsavel_id
`;

const SORT_MAP = {
  codigo: "p.codigo", nome: "p.nome", cliente: "p.cliente", status: "p.status",
  data_inicio: "p.data_inicio", data_fim_prevista: "p.data_fim_prevista", responsavel_nome: "u.nome",
};

async function nextCodigo() {
  const row = await queryOne(`SELECT MAX(id) AS m FROM sge_pm_projeto`);
  return `PRJ-${String((row?.m ?? 0) + 1).padStart(4, "0")}`;
}

router.get("/", requireMenuPermission("projetos", P.VIEW), async (req, res, next) => {
  try {
    const { q, status, ativo, page = 1, limit = 20, sort = "codigo", order = "asc" } = req.query;
    const lim = Math.min(100, Math.max(10, Number(limit) || 20));
    const offset = (Math.max(1, Number(page)) - 1) * lim;
    const where = ["p.deleted_at IS NULL"];
    const params = {};

    if (status) { where.push("p.status = :status"); params.status = status; }
    if (ativo === "0") where.push("p.ativo = 0");
    else if (ativo !== "all") where.push("p.ativo = 1");
    if (q?.trim()) {
      where.push("(p.codigo LIKE :q OR p.nome LIKE :q OR p.descricao LIKE :q OR p.cliente LIKE :q OR u.nome LIKE :q)");
      params.q = `%${q.trim()}%`;
    }

    const whereSql = `WHERE ${where.join(" AND ")}`;
    const sortCol = SORT_MAP[sort] || SORT_MAP.codigo;
    const sortDir = order === "desc" ? "DESC" : "ASC";

    const countRows = await query(
      `SELECT COUNT(*) AS total FROM sge_pm_projeto p LEFT JOIN sge_pm_usuario u ON u.id = p.responsavel_id ${whereSql}`,
      params
    );
    const total = countRows[0]?.total ?? 0;
    const rows = await query(
      `${SELECT} ${whereSql} ORDER BY ${sortCol} ${sortDir} LIMIT ${lim} OFFSET ${offset}`,
      params
    );
    res.json({ data: rows, meta: { page: Number(page), limit: lim, total, totalPages: Math.ceil(total / lim) || 1, sort, order } });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireMenuPermission("projetos", P.VIEW), async (req, res, next) => {
  try {
    const row = await queryOne(`${SELECT} WHERE p.id = ? AND p.deleted_at IS NULL`, [req.params.id]);
    if (!row) return res.status(404).json({ error: { code: "NOT_FOUND" } });
    res.json({ data: row });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/historico", requireMenuPermission("projetos", P.VIEW), async (req, res, next) => {
  try {
    res.json({ data: await getHistorico("projeto", req.params.id) });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireMenuPermission("projetos", P.CREATE), async (req, res, next) => {
  try {
    const b = req.body || {};
    if (!b.nome?.trim()) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Nome obrigatório" } });
    if (b.status && !STATUS_PROJETO.includes(b.status)) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Status inválido" } });
    }
    const codigo = b.codigo || (await nextCodigo());
    await query(
      `INSERT INTO sge_pm_projeto (codigo, nome, descricao, cliente, responsavel_id, data_inicio, data_fim_prevista, status, cor, ativo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo, b.nome.trim(), b.descricao ?? null, b.cliente ?? null, b.responsavel_id ?? null,
        b.data_inicio ?? null, b.data_fim_prevista ?? null, b.status ?? "planejamento",
        b.cor ?? "#1E6FD9", b.ativo !== undefined ? (b.ativo ? 1 : 0) : 1,
      ]
    );
    const created = await queryOne(`${SELECT} ORDER BY p.id DESC LIMIT 1`);
    await logHistorico("projeto", created.id, req.user.id, "criado", b);
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireMenuPermission("projetos", P.UPDATE), async (req, res, next) => {
  try {
    const b = req.body || {};
    const fields = ["nome", "descricao", "cliente", "responsavel_id", "data_inicio", "data_fim_prevista", "status", "cor", "ativo"];
    const sets = ["updated_at = datetime('now')"];
    const params = [];
    for (const f of fields) {
      if (b[f] !== undefined) { sets.push(`${f} = ?`); params.push(f === "ativo" ? (b[f] ? 1 : 0) : b[f]); }
    }
    params.push(req.params.id);
    await query(`UPDATE sge_pm_projeto SET ${sets.join(", ")} WHERE id = ? AND deleted_at IS NULL`, params);
    await logHistorico("projeto", req.params.id, req.user.id, "atualizado", b);
    const updated = await queryOne(`${SELECT} WHERE p.id = ?`, [req.params.id]);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireMenuPermission("projetos", P.DELETE), async (req, res, next) => {
  try {
    await query(`UPDATE sge_pm_projeto SET deleted_at = datetime('now'), ativo = 0 WHERE id = ?`, [req.params.id]);
    await logHistorico("projeto", req.params.id, req.user.id, "exclusao_logica");
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
