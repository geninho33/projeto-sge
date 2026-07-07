import { Router } from "express";
import { query, queryOne } from "../db.js";
import { isAdminUser } from "../services/userRoles.js";

const router = Router();

const SORT_MAP = {
  data: "ap.data",
  usuario_nome: "u.nome",
  projeto_nome: "p.nome",
  demanda_codigo: "d.codigo",
  atividade_titulo: "a.titulo",
  tarefa_titulo: "t.titulo",
  duracao_minutos: "ap.duracao_minutos",
  tipo: "ap.tipo",
  tarefa_status: "t.status",
};

const BASE_FROM = `
  FROM sge_pm_apontamento_tarefa ap
  JOIN sge_pm_atividade_tarefa t ON t.id = ap.tarefa_id
  JOIN sge_pm_atividade a ON a.id = t.atividade_id
  JOIN sge_pm_demanda d ON d.id = a.demanda_id
  LEFT JOIN sge_pm_projeto p ON p.id = d.projeto_id
  JOIN sge_pm_usuario u ON u.id = ap.usuario_id
`;

function buildWhere(req) {
  const {
    q, projeto_id, demanda_id, atividade_id, tarefa_id, executor_id,
    tipo, status, data_de, data_ate,
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
  if (tarefa_id) { where.push("t.id = :tarefa_id"); params.tarefa_id = tarefa_id; }
  if (executor_id) { where.push("t.executor_id = :executor_id"); params.executor_id = executor_id; }
  if (tipo) { where.push("ap.tipo = :tipo"); params.tipo = tipo; }
  if (status) { where.push("t.status = :status"); params.status = status; }
  if (data_de) { where.push("date(ap.data) >= date(:data_de)"); params.data_de = data_de; }
  if (data_ate) { where.push("date(ap.data) <= date(:data_ate)"); params.data_ate = data_ate; }
  if (q?.trim()) {
    where.push(`(
      t.titulo LIKE :q OR a.titulo LIKE :q OR d.codigo LIKE :q OR d.titulo LIKE :q
      OR p.nome LIKE :q OR u.nome LIKE :q OR ap.comentario LIKE :q
    )`);
    params.q = `%${q.trim()}%`;
  }

  return { whereSql: `WHERE ${where.join(" AND ")}`, params };
}

const SELECT_FIELDS = `
  SELECT ap.id, ap.data, ap.hora_inicio, ap.hora_fim, ap.duracao_minutos, ap.comentario, ap.tipo, ap.usuario_id,
         u.nome AS usuario_nome,
         t.id AS tarefa_id, t.titulo AS tarefa_titulo, t.status AS tarefa_status, t.executor_id,
         a.id AS atividade_id, a.titulo AS atividade_titulo,
         d.id AS demanda_id, d.codigo AS demanda_codigo, d.titulo AS demanda_titulo,
         p.id AS projeto_id, p.codigo AS projeto_codigo, p.nome AS projeto_nome
`;

router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sort = "data", order = "desc", exportAll } = req.query;
    const lim = exportAll === "1" ? 5000 : Math.min(100, Math.max(10, Number(limit) || 20));
    const offset = (Math.max(1, Number(page)) - 1) * lim;
    const { whereSql, params } = buildWhere(req);
    const sortCol = SORT_MAP[sort] || SORT_MAP.data;
    const sortDir = order === "asc" ? "ASC" : "DESC";

    const countRows = await query(`SELECT COUNT(*) AS total ${BASE_FROM} ${whereSql}`, params);
    const total = countRows[0]?.total ?? 0;

    const rows = await query(
      `${SELECT_FIELDS} ${BASE_FROM} ${whereSql} ORDER BY ${sortCol} ${sortDir}, ap.id DESC LIMIT ${lim} OFFSET ${offset}`,
      params
    );

    const totaisGerais = await queryOne(
      `SELECT COALESCE(SUM(ap.duracao_minutos), 0) / 60.0 AS total_horas, COUNT(*) AS total_registros
       ${BASE_FROM} ${whereSql}`,
      params
    );

    const porUsuario = await query(
      `SELECT u.id, u.nome, COALESCE(SUM(ap.duracao_minutos), 0) / 60.0 AS total_horas, COUNT(*) AS registros
       ${BASE_FROM} ${whereSql}
       GROUP BY u.id, u.nome ORDER BY total_horas DESC LIMIT 20`,
      params
    );

    const porProjeto = await query(
      `SELECT p.id, p.nome, COALESCE(SUM(ap.duracao_minutos), 0) / 60.0 AS total_horas, COUNT(*) AS registros
       ${BASE_FROM} ${whereSql}
       GROUP BY p.id, p.nome ORDER BY total_horas DESC LIMIT 20`,
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
          total_registros: totaisGerais?.total_registros || 0,
          total_horas: Number(totaisGerais?.total_horas || 0),
          por_usuario: porUsuario,
          por_projeto: porProjeto,
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
       JOIN sge_pm_apontamento_tarefa ap ON ap.tarefa_id = t.id
       WHERE d.deleted_at IS NULL ${userFilter}
       ORDER BY p.nome`,
      userParams
    );
    const executores = await query(
      `SELECT DISTINCT u.id, u.nome FROM sge_pm_usuario u
       JOIN sge_pm_atividade_tarefa t ON t.executor_id = u.id
       JOIN sge_pm_apontamento_tarefa ap ON ap.tarefa_id = t.id
       JOIN sge_pm_atividade a ON a.id = t.atividade_id
       JOIN sge_pm_demanda d ON d.id = a.demanda_id
       WHERE d.deleted_at IS NULL ${userFilter}
       ORDER BY u.nome`,
      userParams
    );

    res.json({ data: { projetos, executores, isAdmin: admin } });
  } catch (err) {
    next(err);
  }
});

export default router;
