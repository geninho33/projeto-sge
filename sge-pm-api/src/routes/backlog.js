import { Router } from "express";
import { query, queryOne } from "../db.js";
import { logHistorico, getHistorico } from "../services/historico.js";
import { getBacklogVisao } from "../services/backlogVisao.js";
import { requireMenuPermission } from "../middleware/auth.js";
import { P } from "../services/menuPermissions.js";

const router = Router();

const SORT_MAP = {
  codigo: "b.codigo",
  titulo: "b.titulo",
  prioridade: "b.prioridade",
  score: "b.score",
  story_points: "b.story_points",
  status_geral: "b.status_geral",
  kanban_status: "b.kanban_status",
  prazo: "b.prazo",
  created_at: "b.created_at",
  responsavel_nome: "u.nome",
  projeto_nome: "p.nome",
};

const BASE_SELECT = `
  SELECT b.*, u.nome AS responsavel_nome, s.nome AS sprint_nome, p.nome AS projeto_nome,
         m.status_front, m.status_back, m.branch_front, m.branch_back,
         uf.nome AS dev_front_nome, ub.nome AS dev_back_nome
  FROM sge_pm_backlog_item b
  LEFT JOIN sge_pm_usuario u ON u.id = b.responsavel_id
  LEFT JOIN sge_pm_sprint s ON s.id = b.sprint_id
  LEFT JOIN sge_pm_projeto p ON p.id = COALESCE(b.projeto_id, 1)
  LEFT JOIN sge_pm_mapeamento_mudanca m ON m.backlog_item_id = b.id
  LEFT JOIN sge_pm_usuario uf ON uf.id = m.id_user_front
  LEFT JOIN sge_pm_usuario ub ON ub.id = m.id_user_back
`;

router.get("/", requireMenuPermission("backlog", P.VIEW), async (req, res, next) => {
  try {
    const {
      prioridade, status, sprint_id, q,
      page = 1, limit = 20,
      sort = "codigo", order = "asc",
    } = req.query;

    const lim = Math.min(100, Math.max(10, Number(limit) || 20));
    const offset = (Math.max(1, Number(page)) - 1) * lim;
    const where = [];
    const params = {};

    if (prioridade) {
      where.push("b.prioridade = :prioridade");
      params.prioridade = prioridade;
    }
    if (status) {
      where.push("(b.status_geral = :status OR b.kanban_status = :status)");
      params.status = status;
    }
    if (sprint_id) {
      where.push("EXISTS (SELECT 1 FROM sge_pm_sprint_backlog_item sbi WHERE sbi.backlog_item_id = b.id AND sbi.sprint_id = :sprint_id)");
      params.sprint_id = Number(sprint_id);
    }
    if (q?.trim()) {
      where.push(`(
        b.codigo LIKE :q OR b.titulo LIKE :q OR b.descricao LIKE :q OR b.tags LIKE :q
        OR b.modulo LIKE :q OR b.observacoes LIKE :q OR b.status_geral LIKE :q
        OR b.kanban_status LIKE :q OR u.nome LIKE :q OR p.nome LIKE :q
      )`);
      params.q = `%${q.trim()}%`;
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const sortCol = SORT_MAP[sort] || SORT_MAP.codigo;
    const sortDir = order === "desc" ? "DESC" : "ASC";

    const countRows = await query(
      `SELECT COUNT(*) AS total FROM sge_pm_backlog_item b
       LEFT JOIN sge_pm_usuario u ON u.id = b.responsavel_id
       LEFT JOIN sge_pm_projeto p ON p.id = COALESCE(b.projeto_id, 1)
       ${whereSql}`,
      params
    );
    const total = countRows[0]?.total ?? 0;
    const rows = await query(
      `${BASE_SELECT} ${whereSql}
       ORDER BY ${sortCol} ${sortDir}, b.codigo ASC
       LIMIT ${lim} OFFSET ${offset}`,
      params
    );
    res.json({
      data: rows,
      meta: { page: Number(page), limit: lim, total, totalPages: Math.ceil(total / lim) || 1, sort, order },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/kanban", requireMenuPermission("kanban", P.VIEW), async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT b.*, m.status_front, m.status_back, m.branch_front, m.branch_back
       FROM sge_pm_backlog_item b
       LEFT JOIN sge_pm_mapeamento_mudanca m ON m.backlog_item_id = b.id
       ORDER BY b.score DESC`
    );
    const columns = { backlog: [], em_andamento: [], bloqueado: [], concluido: [] };
    for (const row of rows) {
      const col = columns[row.status_geral] ?? columns.backlog;
      col.push(row);
    }
    res.json({ data: columns });
  } catch (err) {
    next(err);
  }
});

router.get("/:codigo/visao", async (req, res, next) => {
  try {
    const data = await getBacklogVisao(req.params.codigo);
    if (!data) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Backlog não encontrado" } });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

router.get("/:codigo/historico", async (req, res, next) => {
  try {
    res.json({ data: await getHistorico("backlog", req.params.codigo) });
  } catch (err) {
    next(err);
  }
});

router.put("/:codigo", requireMenuPermission("backlog", P.UPDATE), async (req, res, next) => {
  try {
    const b = req.body || {};
    const item = await queryOne(`SELECT id, sprint_id FROM sge_pm_backlog_item WHERE codigo = ?`, [req.params.codigo]);
    if (!item) return res.status(404).json({ error: { code: "NOT_FOUND" } });

    const fields = [
      "titulo", "descricao", "prioridade", "status_geral", "kanban_status", "responsavel_id",
      "sprint_id", "projeto_id", "prazo", "estimativa", "criterios_aceite", "tags", "observacoes", "story_points",
    ];
    const sets = ["updated_at = datetime('now')"];
    const params = [];
    for (const f of fields) {
      if (b[f] !== undefined) { sets.push(`${f} = ?`); params.push(b[f]); }
    }
    params.push(req.params.codigo);
    await query(`UPDATE sge_pm_backlog_item SET ${sets.join(", ")} WHERE codigo = ?`, params);
    await logHistorico("backlog", req.params.codigo, req.user.id, "atualizado", b);
    if (b.sprint_id ?? item.sprint_id) await recalcSprintProgress(b.sprint_id ?? item.sprint_id);
    const updated = await queryOne(`${BASE_SELECT} WHERE b.codigo = ?`, [req.params.codigo]);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

router.get("/:codigo", async (req, res, next) => {
  try {
    const item = await queryOne(`${BASE_SELECT} WHERE b.codigo = ?`, [req.params.codigo]);
    if (!item) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Item não encontrado" } });
    const skills = await query(
      `SELECT s.* FROM sge_pm_skill s
       JOIN sge_pm_backlog_item_skill bis ON bis.skill_id = s.id
       WHERE bis.backlog_item_id = ?`,
      [item.id]
    );
    res.json({ data: { ...item, skills } });
  } catch (err) {
    next(err);
  }
});

router.patch("/:codigo/status", requireMenuPermission("backlog", P.UPDATE), async (req, res, next) => {
  try {
    const { status_geral } = req.body;
    await query("UPDATE sge_pm_backlog_item SET status_geral = ? WHERE codigo = ?", [status_geral, req.params.codigo]);
    res.json({ data: { ok: true } });
  } catch (err) {
    next(err);
  }
});

export default router;
