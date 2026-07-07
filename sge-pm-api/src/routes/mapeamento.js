import { Router } from "express";
import { query, queryOne, useSqlite } from "../db.js";
import { branchSlug } from "../services/skillResolver.js";
import { logHistorico } from "../services/historico.js";
import { requireMenuPermission } from "../middleware/auth.js";
import { P } from "../services/menuPermissions.js";

const router = Router();

const SORT_MAP = {
  codigo: "b.codigo",
  titulo: "b.titulo",
  prioridade: "b.prioridade",
  score: "b.score",
  status_front: "m.status_front",
  status_back: "m.status_back",
  dev_front_nome: "uf.nome",
  dev_back_nome: "ub.nome",
  branch_front: "m.branch_front",
  branch_back: "m.branch_back",
};

const BASE_FROM = `
  FROM sge_pm_mapeamento_mudanca m
  JOIN sge_pm_backlog_item b ON b.id = m.backlog_item_id
  LEFT JOIN sge_pm_usuario uf ON uf.id = m.id_user_front
  LEFT JOIN sge_pm_usuario ub ON ub.id = m.id_user_back
  LEFT JOIN sge_pm_projeto p ON p.id = COALESCE(b.projeto_id, 1)
`;

router.get("/", requireMenuPermission("admin_mapeamento", P.VIEW), async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20, sort = "codigo", order = "asc" } = req.query;
    const lim = Math.min(100, Math.max(10, Number(limit) || 20));
    const offset = (Math.max(1, Number(page)) - 1) * lim;
    const where = ["1=1"];
    const params = {};

    if (q?.trim()) {
      where.push(`(
        b.codigo LIKE :q OR b.titulo LIKE :q OR b.descricao LIKE :q OR b.tags LIKE :q
        OR m.branch_front LIKE :q OR m.branch_back LIKE :q OR m.api_contract_path LIKE :q
        OR m.status_front LIKE :q OR m.status_back LIKE :q
        OR uf.nome LIKE :q OR ub.nome LIKE :q OR p.nome LIKE :q
      )`);
      params.q = `%${q.trim()}%`;
    }

    const whereSql = `WHERE ${where.join(" AND ")}`;
    const sortCol = SORT_MAP[sort] || SORT_MAP.codigo;
    const sortDir = order === "desc" ? "DESC" : "ASC";

    const countRows = await query(
      `SELECT COUNT(*) AS total ${BASE_FROM} ${whereSql}`,
      params
    );
    const total = countRows[0]?.total ?? 0;

    const rows = await query(
      `SELECT m.*, b.codigo, b.titulo, b.descricao, b.score, b.prioridade, b.tags, b.status_geral,
              p.nome AS projeto_nome,
              uf.nome AS dev_front_nome, ub.nome AS dev_back_nome
       ${BASE_FROM} ${whereSql}
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

router.get("/:codigo", requireMenuPermission("admin_mapeamento", P.VIEW), async (req, res, next) => {
  try {
    const row = await queryOne(
      `SELECT m.*, b.codigo, b.titulo, b.descricao, b.score, b.prioridade, b.tags, p.nome AS projeto_nome
       ${BASE_FROM} WHERE b.codigo = ?`,
      [req.params.codigo]
    );
    if (!row) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Mapeamento não encontrado" } });
    res.json({ data: row });
  } catch (err) {
    next(err);
  }
});

router.patch("/:codigo", requireMenuPermission("admin_mapeamento", P.UPDATE), async (req, res, next) => {
  try {
    const codigo = req.params.codigo;
    const item = await queryOne("SELECT id, titulo FROM sge_pm_backlog_item WHERE codigo = ?", [codigo]);
    if (!item) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Item não encontrado" } });

    const {
      id_user_front, id_user_back, status_front, status_back,
      branch_front, branch_back, api_contract_path, pr_front_url, pr_back_url,
    } = req.body;

    const slug = branchSlug(codigo, item.titulo);
    const vals = [
      item.id,
      id_user_front ?? null,
      id_user_back ?? null,
      branch_front ?? `feature/frontend/${slug}`,
      branch_back ?? `feature/backend/${slug}`,
      status_front ?? "nao_iniciado",
      status_back ?? "nao_iniciado",
      api_contract_path ?? `docs/api-contracts/${codigo}.yaml`,
      pr_front_url ?? null,
      pr_back_url ?? null,
    ];

    if (useSqlite()) {
      await query(
        `INSERT INTO sge_pm_mapeamento_mudanca
           (backlog_item_id, id_user_front, id_user_back, branch_front, branch_back,
            status_front, status_back, api_contract_path, pr_front_url, pr_back_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(backlog_item_id) DO UPDATE SET
           id_user_front = COALESCE(excluded.id_user_front, id_user_front),
           id_user_back = COALESCE(excluded.id_user_back, id_user_back),
           branch_front = COALESCE(excluded.branch_front, branch_front),
           branch_back = COALESCE(excluded.branch_back, branch_back),
           status_front = COALESCE(excluded.status_front, status_front),
           status_back = COALESCE(excluded.status_back, status_back),
           api_contract_path = COALESCE(excluded.api_contract_path, api_contract_path),
           pr_front_url = COALESCE(excluded.pr_front_url, pr_front_url),
           pr_back_url = COALESCE(excluded.pr_back_url, pr_back_url)`,
        vals
      );
    } else {
      await query(
        `INSERT INTO sge_pm_mapeamento_mudanca
           (backlog_item_id, id_user_front, id_user_back, branch_front, branch_back,
            status_front, status_back, api_contract_path, pr_front_url, pr_back_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           id_user_front = COALESCE(VALUES(id_user_front), id_user_front),
           id_user_back = COALESCE(VALUES(id_user_back), id_user_back),
           branch_front = COALESCE(VALUES(branch_front), branch_front),
           branch_back = COALESCE(VALUES(branch_back), branch_back),
           status_front = COALESCE(VALUES(status_front), status_front),
           status_back = COALESCE(VALUES(status_back), status_back),
           api_contract_path = COALESCE(VALUES(api_contract_path), api_contract_path),
           pr_front_url = COALESCE(VALUES(pr_front_url), pr_front_url),
           pr_back_url = COALESCE(VALUES(pr_back_url), pr_back_url)`,
        vals
      );
    }

    await logHistorico("mapeamento", codigo, req.user.id, "atualizado", req.body);
    const updated = await queryOne(
      `SELECT m.*, b.codigo, b.titulo, b.prioridade, p.nome AS projeto_nome,
              uf.nome AS dev_front_nome, ub.nome AS dev_back_nome
       ${BASE_FROM} WHERE b.codigo = ?`,
      [codigo]
    );
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
