import { Router } from "express";
import { query, queryOne } from "../db.js";
import { isAdminUser } from "../services/userRoles.js";
import { requireMenuPermission } from "../middleware/auth.js";
import { P } from "../services/menuPermissions.js";

const router = Router();
router.use(requireMenuPermission("consulta_tarefas", P.VIEW));

const SORT_MAP = {
  titulo: "t.titulo",
  status: "t.status",
  executor_nome: "u.nome",
  demanda_codigo: "d.codigo",
  atividade_titulo: "a.titulo",
  projeto_nome: "p.nome",
  data_inicio: "t.data_inicio",
  horas_apontadas: "horas_apontadas",
  created_at: "t.created_at",
};

const BASE_FROM = `
  FROM sge_pm_atividade_tarefa t
  JOIN sge_pm_atividade a ON a.id = t.atividade_id
  JOIN sge_pm_demanda d ON d.id = a.demanda_id
  LEFT JOIN sge_pm_projeto p ON p.id = d.projeto_id
  LEFT JOIN sge_pm_usuario u ON u.id = t.executor_id
`;

function buildWhere(req) {
  const {
    q, projeto_id, demanda_id, atividade_id, executor_id, status,
    backlog_id, data_inicio_de, data_inicio_ate,
  } = req.query;

  const where = ["d.deleted_at IS NULL"];
  const params = {};

  if (!isAdminUser(req.user)) {
    where.push("t.executor_id = :userId");
    params.userId = req.user.id;
  }
  if (projeto_id) { where.push("d.projeto_id = :projeto_id"); params.projeto_id = projeto_id; }
  if (demanda_id) { where.push("d.id = :demanda_id"); params.demanda_id = demanda_id; }
  if (atividade_id) { where.push("a.id = :atividade_id"); params.atividade_id = atividade_id; }
  if (executor_id) { where.push("t.executor_id = :executor_id"); params.executor_id = executor_id; }
  if (status) { where.push("t.status = :status"); params.status = status; }
  if (data_inicio_de) { where.push("date(t.data_inicio) >= date(:data_inicio_de)"); params.data_inicio_de = data_inicio_de; }
  if (data_inicio_ate) { where.push("date(t.data_inicio) <= date(:data_inicio_ate)"); params.data_inicio_ate = data_inicio_ate; }
  if (backlog_id) {
    where.push(`EXISTS (SELECT 1 FROM sge_pm_tarefa_backlog tb WHERE tb.tarefa_id = t.id AND tb.backlog_item_id = :backlog_id)`);
    params.backlog_id = backlog_id;
  }
  if (q?.trim()) {
    where.push(`(
      t.titulo LIKE :q OR t.descricao LIKE :q OR d.codigo LIKE :q OR d.titulo LIKE :q
      OR a.titulo LIKE :q OR p.nome LIKE :q OR u.nome LIKE :q
    )`);
    params.q = `%${q.trim()}%`;
  }

  return { whereSql: `WHERE ${where.join(" AND ")}`, params };
}

const SELECT_FIELDS = `
  SELECT t.id, t.titulo, t.status, t.data_inicio, t.descricao, t.created_at,
         t.executor_id, u.nome AS executor_nome,
         a.id AS atividade_id, a.titulo AS atividade_titulo,
         d.id AS demanda_id, d.codigo AS demanda_codigo, d.titulo AS demanda_titulo,
         p.id AS projeto_id, p.codigo AS projeto_codigo, p.nome AS projeto_nome,
         COALESCE((SELECT SUM(ap.duracao_minutos) FROM sge_pm_apontamento_tarefa ap WHERE ap.tarefa_id = t.id), 0) / 60.0 AS horas_apontadas,
         (SELECT COUNT(*) FROM sge_pm_apontamento_tarefa ap WHERE ap.tarefa_id = t.id) AS total_apontamentos
`;

router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sort = "created_at", order = "desc", exportAll } = req.query;
    const lim = exportAll === "1" ? 5000 : Math.min(100, Math.max(10, Number(limit) || 20));
    const offset = (Math.max(1, Number(page)) - 1) * lim;
    const { whereSql, params } = buildWhere(req);
    const sortCol = SORT_MAP[sort] || SORT_MAP.created_at;
    const sortDir = order === "asc" ? "ASC" : "DESC";

    const countRows = await query(`SELECT COUNT(*) AS total ${BASE_FROM} ${whereSql}`, params);
    const total = countRows[0]?.total ?? 0;

    const rows = await query(
      `${SELECT_FIELDS} ${BASE_FROM} ${whereSql} ORDER BY ${sortCol} ${sortDir} LIMIT ${lim} OFFSET ${offset}`,
      params
    );

    const totais = await queryOne(
      `SELECT COALESCE(SUM(sub.horas), 0) AS total_horas, COUNT(*) AS total_tarefas
       FROM (
         SELECT t.id,
           COALESCE((SELECT SUM(ap.duracao_minutos) FROM sge_pm_apontamento_tarefa ap WHERE ap.tarefa_id = t.id), 0) / 60.0 AS horas
         ${BASE_FROM} ${whereSql}
       ) sub`,
      params
    );

    res.json({
      data: rows,
      meta: {
        page: Number(page),
        limit: lim,
        total,
        totalPages: Math.ceil(total / lim) || 1,
        sort,
        order,
        totais: {
          total_tarefas: totais?.total_tarefas || 0,
          total_horas: Number(totais?.total_horas || 0),
        },
        isAdmin: isAdminUser(req.user),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/filtros", async (req, res, next) => {
  try {
    const admin = isAdminUser(req.user);
    const userFilter = admin ? "" : "AND t.executor_id = ?";
    const userParams = admin ? [] : [req.user.id];

    const projetos = await query(
      `SELECT DISTINCT p.id, p.codigo, p.nome FROM sge_pm_projeto p
       JOIN sge_pm_demanda d ON d.projeto_id = p.id
       JOIN sge_pm_atividade a ON a.demanda_id = d.id
       JOIN sge_pm_atividade_tarefa t ON t.atividade_id = a.id
       WHERE d.deleted_at IS NULL ${userFilter}
       ORDER BY p.nome`,
      userParams
    );
    const executores = await query(
      `SELECT DISTINCT u.id, u.nome FROM sge_pm_usuario u
       JOIN sge_pm_atividade_tarefa t ON t.executor_id = u.id
       JOIN sge_pm_atividade a ON a.id = t.atividade_id
       JOIN sge_pm_demanda d ON d.id = a.demanda_id
       WHERE d.deleted_at IS NULL ${userFilter}
       ORDER BY u.nome`,
      userParams
    );
    const backlogs = await query(
      `SELECT DISTINCT b.id, b.codigo, b.titulo FROM sge_pm_backlog_item b
       JOIN sge_pm_tarefa_backlog tb ON tb.backlog_item_id = b.id
       JOIN sge_pm_atividade_tarefa t ON t.id = tb.tarefa_id
       JOIN sge_pm_atividade a ON a.id = t.atividade_id
       JOIN sge_pm_demanda d ON d.id = a.demanda_id
       WHERE d.deleted_at IS NULL ${userFilter}
       ORDER BY b.codigo`,
      userParams
    );

    res.json({ data: { projetos, executores, backlogs, isAdmin: admin } });
  } catch (err) {
    next(err);
  }
});

export default router;
