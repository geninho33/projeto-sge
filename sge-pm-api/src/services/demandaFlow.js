import { query, queryOne } from "../db.js";
import { getTarefasEnriched } from "./tarefaStatus.js";
import { FASES_DEMANDA } from "./schemaV4.js";

export const FASE_ORDER = ["criacao", "analise", "desenvolvimento", "homologacao", "aprovacao"];

export function nextPhase(fase) {
  if (fase === "cancelada") return null;
  const idx = FASE_ORDER.indexOf(fase);
  if (idx < 0 || idx >= FASE_ORDER.length - 1) return null;
  return FASE_ORDER[idx + 1];
}

export async function getPendingActivities(demandaId, fase) {
  return query(
    `SELECT a.id, a.titulo, a.status, t.nome AS tipo_nome
     FROM sge_pm_atividade a
     LEFT JOIN sge_pm_tipo_atividade t ON t.id = a.tipo_atividade_id
     WHERE a.demanda_id = ? AND a.fase = ? AND a.status != 'concluida'`,
    [demandaId, fase]
  );
}

export async function canAdvancePhase(demandaId, fase) {
  const pending = await getPendingActivities(demandaId, fase);
  return { ok: pending.length === 0, pending };
}

export async function enrichDemanda(row) {
  if (!row) return null;
  row.links = await query(`SELECT * FROM sge_pm_demanda_link WHERE demanda_id = ?`, [row.id]);
  row.anexos = await query(`SELECT * FROM sge_pm_demanda_anexo WHERE demanda_id = ?`, [row.id]);
  row.atividades = await query(
    `SELECT a.*, t.nome AS tipo_nome, t.cor AS tipo_cor, t.icone AS tipo_icone,
            u.nome AS usuario_executor_nome, u.nome AS executor_nome,
            p.nome AS projeto_nome, d.projeto_id,
            COALESCE((SELECT SUM(duracao_minutos) FROM sge_pm_apontamento_atividade ap WHERE ap.atividade_id = a.id), 0) / 60.0 AS horas_realizadas
     FROM sge_pm_atividade a
     JOIN sge_pm_demanda d ON d.id = a.demanda_id
     LEFT JOIN sge_pm_projeto p ON p.id = d.projeto_id
     LEFT JOIN sge_pm_tipo_atividade t ON t.id = a.tipo_atividade_id
     LEFT JOIN sge_pm_usuario u ON u.id = a.executor_id
     WHERE a.demanda_id = ? ORDER BY a.id`,
    [row.id]
  );
  for (const at of row.atividades) {
    at.tarefas = await getTarefasEnriched(at.id);
    at.backlogs = await query(
      `SELECT b.id, b.codigo, b.titulo, p.nome AS projeto_nome FROM sge_pm_atividade_backlog ab
       JOIN sge_pm_backlog_item b ON b.id = ab.backlog_item_id
       LEFT JOIN sge_pm_projeto p ON p.id = COALESCE(b.projeto_id, 1)
       WHERE ab.atividade_id = ? ORDER BY p.nome, b.titulo`,
      [at.id]
    );
  }
  row.tramitacoes = await query(
    `SELECT t.*, u.nome AS usuario_nome FROM sge_pm_tramitacao t
     JOIN sge_pm_usuario u ON u.id = t.usuario_id WHERE t.demanda_id = ? ORDER BY t.created_at DESC`,
    [row.id]
  );
  row.comentarios = await query(
    `SELECT c.*, u.nome AS autor_nome FROM sge_pm_comentario c
     JOIN sge_pm_usuario u ON u.id = c.autor_id
     WHERE c.entidade_tipo = 'demanda' AND c.entidade_id = ? ORDER BY c.created_at`,
    [row.id]
  );
  return row;
}

export function validateFase(fase) {
  return FASES_DEMANDA.includes(fase);
}
