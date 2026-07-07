import { Router } from "express";
import { query, queryOne } from "../db.js";
import { ensureArray } from "../lib/ensureArray.js";
import { isManagerUser } from "../services/profileService.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const rows = await query("SELECT * FROM sge_pm_projeto ORDER BY id");
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const rows = await query("SELECT * FROM sge_pm_projeto WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Projeto não encontrado" } });
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/dashboard-gestor", async (req, res, next) => {
  try {
    if (!isManagerUser(req.user)) {
      return res.status(403).json({ error: { code: "FORBIDDEN", message: "Acesso restrito a gestores" } });
    }

    const projetoId = req.params.id;
    const hoje = new Date().toISOString().slice(0, 10);

    const demandasPorSituacao = await query(
      `SELECT situacao_trabalho, COUNT(*) AS total FROM sge_pm_demanda GROUP BY situacao_trabalho`
    );

    const emAndamento = await queryOne(
      `SELECT COUNT(*) AS c FROM sge_pm_demanda WHERE situacao_trabalho = 'em_andamento'`
    );
    const concluidas = await queryOne(
      `SELECT COUNT(*) AS c FROM sge_pm_demanda WHERE situacao_trabalho = 'concluida'`
    );
    const atrasadas = await queryOne(
      `SELECT COUNT(*) AS c FROM sge_pm_demanda WHERE prazo < ? AND situacao_trabalho NOT IN ('concluida')`,
      [hoje]
    );

    const horasPorColaborador = await query(
      `SELECT u.id, u.nome, COALESCE(SUM(a.duracao_minutos), 0) / 60.0 AS horas
       FROM sge_pm_usuario u
       LEFT JOIN sge_pm_apontamento a ON a.usuario_id = u.id
       WHERE u.ativo = 1 AND u.deleted_at IS NULL
       GROUP BY u.id ORDER BY horas DESC`
    );

    const horasPorProjeto = await query(
      `SELECT p.nome, COALESCE(SUM(a.duracao_minutos), 0) / 60.0 AS horas
       FROM sge_pm_projeto p
       LEFT JOIN sge_pm_demanda d ON d.projeto_id = p.id
       LEFT JOIN sge_pm_apontamento a ON a.demanda_id = d.id
       WHERE p.id = ?
       GROUP BY p.id`,
      [projetoId]
    );

    const horasPorSprint = await query(
      `SELECT s.nome, COALESCE(SUM(a.duracao_minutos), 0) / 60.0 AS horas,
              COALESCE(SUM(d.horas_estimadas), 0) AS horas_estimadas
       FROM sge_pm_sprint s
       LEFT JOIN sge_pm_demanda d ON d.sprint_id = s.id
       LEFT JOIN sge_pm_apontamento a ON a.demanda_id = d.id
       WHERE s.projeto_id = ?
       GROUP BY s.id ORDER BY s.numero`,
      [projetoId]
    );

    const planejadoVsRealizado = await queryOne(
      `SELECT COALESCE(SUM(horas_estimadas), 0) AS planejado,
              (SELECT COALESCE(SUM(duracao_minutos), 0) / 60.0 FROM sge_pm_apontamento) AS realizado
       FROM sge_pm_demanda`
    );

    const timersAtivos = await query(
      `SELECT t.*, u.nome AS usuario_nome, d.codigo AS demanda_codigo, d.titulo AS demanda_titulo
       FROM sge_pm_timer_ativo t
       JOIN sge_pm_usuario u ON u.id = t.usuario_id
       JOIN sge_pm_demanda d ON d.id = t.demanda_id`
    );

    const evolucaoSemanal = await query(
      `SELECT data, SUM(duracao_minutos) / 60.0 AS horas
       FROM sge_pm_apontamento
       WHERE data >= date('now', '-28 days')
       GROUP BY data ORDER BY data`
    );

    const demandasRecentes = await query(
      `SELECT d.id, d.codigo, d.titulo, d.situacao_trabalho, d.percentual_execucao, d.updated_at,
              u.nome AS responsavel_nome,
              COALESCE((SELECT SUM(duracao_minutos) FROM sge_pm_apontamento a WHERE a.demanda_id = d.id), 0) / 60.0 AS horas_apontadas
       FROM sge_pm_demanda d
       LEFT JOIN sge_pm_usuario u ON u.id = d.responsavel_id
       ORDER BY d.updated_at DESC LIMIT 10`
    );

    res.json({
      data: {
        resumo: {
          em_andamento: emAndamento?.c ?? 0,
          concluidas: concluidas?.c ?? 0,
          atrasadas: atrasadas?.c ?? 0,
          planejado_horas: planejadoVsRealizado?.planejado ?? 0,
          realizado_horas: planejadoVsRealizado?.realizado ?? 0,
        },
        demandas_por_situacao: demandasPorSituacao,
        horas_por_colaborador: horasPorColaborador,
        horas_por_projeto: horasPorProjeto,
        horas_por_sprint: horasPorSprint,
        timers_ativos: timersAtivos,
        evolucao_semanal: evolucaoSemanal,
        demandas_recentes: demandasRecentes,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/dashboard", async (req, res, next) => {
  try {
    const id = req.params.id;
    const totais = await query(
      `SELECT prioridade, status_geral, COUNT(*) AS total
       FROM sge_pm_backlog_item GROUP BY prioridade, status_geral`
    );
    const sprints = await query(
      `SELECT s.*, COALESCE(SUM(sbi.story_points), 0) AS points_alocados
       FROM sge_pm_sprint s
       LEFT JOIN sge_pm_sprint_backlog_item sbi ON sbi.sprint_id = s.id
       WHERE s.projeto_id = ?
       GROUP BY s.id ORDER BY s.numero`,
      [id]
    );
    res.json({ data: { totais: ensureArray(totais), sprints: ensureArray(sprints) } });
  } catch (err) {
    next(err);
  }
});

export default router;
