import { query, queryOne } from "../db.js";
import { syncDemandaFaseFromAtividades } from "./demandaProgressao.js";

export const STATUS_TAREFA = ["aguardando", "em_andamento", "concluida"];

const TAREFA_SELECT = `
  SELECT t.*, u.nome AS executor_nome, ta.nome AS tipo_nome, ta.cor AS tipo_cor,
         COALESCE((SELECT SUM(ap.duracao_minutos) FROM sge_pm_apontamento_tarefa ap WHERE ap.tarefa_id = t.id), 0) / 60.0 AS horas_apontadas,
         (SELECT COUNT(*) FROM sge_pm_apontamento_tarefa ap WHERE ap.tarefa_id = t.id) AS total_apontamentos
  FROM sge_pm_atividade_tarefa t
  LEFT JOIN sge_pm_usuario u ON u.id = t.executor_id
  LEFT JOIN sge_pm_tipo_atividade ta ON ta.id = t.tipo_atividade_id
`;

export async function getApontamentosTarefa(tarefaId) {
  return query(
    `SELECT ap.*, u.nome AS usuario_nome FROM sge_pm_apontamento_tarefa ap
     JOIN sge_pm_usuario u ON u.id = ap.usuario_id
     WHERE ap.tarefa_id = ? ORDER BY ap.data DESC, ap.hora_inicio DESC`,
    [tarefaId]
  );
}

export async function countApontamentos(tarefaId) {
  const row = await queryOne(
    `SELECT COUNT(*) AS c FROM sge_pm_apontamento_tarefa WHERE tarefa_id = ?`,
    [tarefaId]
  );
  return row?.c ?? 0;
}

export function computeStatusAtividadeFromTarefas(tarefas) {
  if (!tarefas?.length) return "aguardando";
  const statuses = tarefas.map((t) => t.status || (t.concluida ? "concluida" : "aguardando"));
  if (statuses.every((s) => s === "concluida")) return "concluida";
  return "em_andamento";
}

export function computePercentualAtividade(tarefas) {
  if (!tarefas?.length) return 0;
  const done = tarefas.filter((t) => (t.status || (t.concluida ? "concluida" : "")) === "concluida").length;
  return Math.round((done / tarefas.length) * 100);
}

export async function getTarefasEnriched(atividadeId) {
  const rows = await query(`${TAREFA_SELECT} WHERE t.atividade_id = ? ORDER BY t.ordem, t.id`, [atividadeId]);
  for (const t of rows) {
    t.apontamentos = await getApontamentosTarefa(t.id);
  }
  return rows;
}

export async function getTarefaEnriched(tarefaId) {
  const row = await queryOne(`${TAREFA_SELECT} WHERE t.id = ?`, [tarefaId]);
  if (!row) return null;
  row.apontamentos = await getApontamentosTarefa(tarefaId);
  return row;
}

export async function recalcAtividadeFromTarefas(atividadeId) {
  const tarefas = await query(
    `SELECT id, status, concluida FROM sge_pm_atividade_tarefa WHERE atividade_id = ?`,
    [atividadeId]
  );
  const status = computeStatusAtividadeFromTarefas(tarefas);
  const percentual = computePercentualAtividade(tarefas);
  await query(
    `UPDATE sge_pm_atividade SET status = ?, percentual_execucao = ?, updated_at = datetime('now') WHERE id = ?`,
    [status, percentual, atividadeId]
  );
  const atividade = await queryOne(`SELECT demanda_id FROM sge_pm_atividade WHERE id = ?`, [atividadeId]);
  if (atividade?.demanda_id) await syncDemandaFaseFromAtividades(atividade.demanda_id);
  return { status, percentual_execucao: percentual, tarefas: await getTarefasEnriched(atividadeId) };
}

export async function setTarefaEmAndamento(tarefaId) {
  await query(
    `UPDATE sge_pm_atividade_tarefa SET status = 'em_andamento', updated_at = datetime('now')
     WHERE id = ? AND status = 'aguardando'`,
    [tarefaId]
  );
}

export async function tryConcluirTarefa(tarefaId) {
  const total = await countApontamentos(tarefaId);
  if (total === 0) {
    return {
      ok: false,
      message: "Não é possível concluir esta tarefa sem registrar ao menos um apontamento de horas.",
    };
  }
  await query(
    `UPDATE sge_pm_atividade_tarefa SET status = 'concluida', concluida = 1, updated_at = datetime('now') WHERE id = ?`,
    [tarefaId]
  );
  return { ok: true };
}

export { TAREFA_SELECT };
