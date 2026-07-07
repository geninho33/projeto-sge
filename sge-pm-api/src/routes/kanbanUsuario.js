import { Router } from "express";
import { query, queryOne } from "../db.js";
import { CORES_TIPO } from "../services/schemaV4.js";
import { logHistorico } from "../services/historico.js";

const router = Router();

const MEU_KANBAN_FASES = ["desenvolvimento", "homologacao", "aprovacao", "cancelada"];

router.get("/", async (req, res, next) => {
  try {
    const usuarioId = req.user.id;
    const columns = {};
    for (const fase of MEU_KANBAN_FASES) columns[fase] = [];

    const demandas = await query(
      `SELECT DISTINCT d.*, p.nome AS projeto_nome, p.cor AS projeto_cor, p.codigo AS projeto_codigo
       FROM sge_pm_demanda d
       LEFT JOIN sge_pm_projeto p ON p.id = d.projeto_id
       WHERE d.deleted_at IS NULL
         AND d.fase IN (${MEU_KANBAN_FASES.map(() => "?").join(",")})
         AND EXISTS (
           SELECT 1 FROM sge_pm_atividade_tarefa t
           JOIN sge_pm_atividade a ON a.id = t.atividade_id
           WHERE a.demanda_id = d.id AND t.executor_id = ?
         )
       ORDER BY d.updated_at DESC`,
      [...MEU_KANBAN_FASES, usuarioId]
    );

    const hoje = new Date().toISOString().slice(0, 10);
    for (const d of demandas) {
      const fase = d.fase || "desenvolvimento";
      d.atrasada = d.data_prevista_termino && d.data_prevista_termino < hoje && fase !== "aprovacao" && fase !== "cancelada";

      const horasRow = await queryOne(
        `SELECT COALESCE(SUM(ap.duracao_minutos), 0) AS t
         FROM sge_pm_apontamento_tarefa ap
         JOIN sge_pm_atividade_tarefa tar ON tar.id = ap.tarefa_id
         JOIN sge_pm_atividade a ON a.id = tar.atividade_id
         WHERE a.demanda_id = ? AND tar.executor_id = ?`,
        [d.id, usuarioId]
      );
      d.horas_apontadas = (horasRow?.t ?? 0) / 60;

      const tarefasCount = await queryOne(
        `SELECT COUNT(*) AS c FROM sge_pm_atividade_tarefa t
         JOIN sge_pm_atividade a ON a.id = t.atividade_id
         WHERE a.demanda_id = ? AND t.executor_id = ?`,
        [d.id, usuarioId]
      );
      d.minhas_tarefas = tarefasCount?.c || 0;

      const comentariosCount = await queryOne(
        `SELECT COUNT(*) AS c FROM sge_pm_comentario WHERE entidade_tipo = 'demanda' AND entidade_id = ?`,
        [d.id]
      );
      d.total_comentarios = comentariosCount?.c || 0;

      const tramitacoesCount = await queryOne(
        `SELECT COUNT(*) AS c FROM sge_pm_tramitacao WHERE demanda_id = ?`,
        [d.id]
      );
      d.total_tramitacoes = tramitacoesCount?.c || 0;

      if (columns[fase]) columns[fase].push(d);
    }

    res.json({ data: { columns, columnOrder: MEU_KANBAN_FASES, cores: CORES_TIPO } });
  } catch (err) {
    next(err);
  }
});

router.patch("/move", async (req, res, next) => {
  try {
    const { demanda_id, fase } = req.body || {};
    if (!demanda_id || !fase) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "demanda_id e fase obrigatórios" } });
    }
    if (!MEU_KANBAN_FASES.includes(fase)) {
      return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Fase inválida" } });
    }

    await query(`UPDATE sge_pm_demanda SET fase = ?, updated_at = datetime('now') WHERE id = ?`, [fase, demanda_id]);
    await logHistorico("demanda", demanda_id, req.user.id, "kanban_move", { fase });

    const updated = await query(`SELECT * FROM sge_pm_demanda WHERE id = ?`, [demanda_id]);
    res.json({ data: updated[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
