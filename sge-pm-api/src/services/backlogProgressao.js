import { query } from "../db.js";
import { FASE_ORDER } from "./demandaFlow.js";
import { FASES_DEMANDA } from "./schemaV4.js";

const PROGRESSAO_FASES = FASES_DEMANDA.filter((f) => f !== "cancelada");

export function resolveEffectiveActivityFase(atividade) {
  if (!atividade) return "criacao";
  if (atividade.fase === "cancelada" || atividade.demanda_fase === "cancelada") return "cancelada";

  const actFase = PROGRESSAO_FASES.includes(atividade.fase) ? atividade.fase : "criacao";
  const demFase = FASES_DEMANDA.includes(atividade.demanda_fase) ? atividade.demanda_fase : "criacao";
  if (demFase === "cancelada") return "cancelada";

  const actIdx = FASE_ORDER.indexOf(actFase);
  const demIdx = FASE_ORDER.indexOf(demFase);
  return demIdx > actIdx ? demFase : actFase;
}

/** Fase do backlog = estágio mais avançado entre as atividades vinculadas (fase efetiva). */
export function deriveBacklogFaseFromAtividades(atividades) {
  if (!atividades?.length) return "criacao";

  const active = atividades.filter(
    (a) => a.demanda_fase !== "cancelada" && resolveEffectiveActivityFase(a) !== "cancelada"
  );
  if (!active.length) return "criacao";

  let maxIdx = -1;
  let fase = "criacao";
  for (const a of active) {
    const effective = resolveEffectiveActivityFase(a);
    const idx = FASE_ORDER.indexOf(effective);
    if (idx > maxIdx) {
      maxIdx = idx;
      fase = effective;
    }
  }
  return PROGRESSAO_FASES.includes(fase) ? fase : "criacao";
}

export async function getAtividadesForBacklog(backlogItemId) {
  return query(
    `SELECT DISTINCT a.fase, a.status, d.fase AS demanda_fase
     FROM sge_pm_atividade a
     JOIN sge_pm_demanda d ON d.id = a.demanda_id AND d.deleted_at IS NULL
     WHERE a.id IN (
       SELECT ab.atividade_id FROM sge_pm_atividade_backlog ab WHERE ab.backlog_item_id = ?
       UNION
       SELECT t.atividade_id FROM sge_pm_tarefa_backlog tb
       JOIN sge_pm_atividade_tarefa t ON t.id = tb.tarefa_id
       WHERE tb.backlog_item_id = ?
     )`,
    [backlogItemId, backlogItemId]
  );
}

export async function getAtividadesGroupedByBacklog() {
  const rows = await query(
    `SELECT ab.backlog_item_id, a.fase, a.status, d.fase AS demanda_fase
     FROM sge_pm_atividade_backlog ab
     JOIN sge_pm_atividade a ON a.id = ab.atividade_id
     JOIN sge_pm_demanda d ON d.id = a.demanda_id AND d.deleted_at IS NULL
     UNION
     SELECT tb.backlog_item_id, a.fase, a.status, d.fase AS demanda_fase
     FROM sge_pm_tarefa_backlog tb
     JOIN sge_pm_atividade_tarefa t ON t.id = tb.tarefa_id
     JOIN sge_pm_atividade a ON a.id = t.atividade_id
     JOIN sge_pm_demanda d ON d.id = a.demanda_id AND d.deleted_at IS NULL`
  );

  const grouped = new Map();
  for (const row of rows) {
    const id = row.backlog_item_id;
    if (!grouped.has(id)) grouped.set(id, []);
    const list = grouped.get(id);
    const key = `${row.fase}|${row.status}|${row.demanda_fase}`;
    if (!list.some((r) => `${r.fase}|${r.status}|${r.demanda_fase}` === key)) {
      list.push(row);
    }
  }
  return grouped;
}

export async function resolveBacklogFase(backlogItemId) {
  const atividades = await getAtividadesForBacklog(backlogItemId);
  if (!atividades.length) return "criacao";
  return deriveBacklogFaseFromAtividades(atividades);
}

export async function syncBacklogsForAtividade(atividadeId) {
  const backlogs = await query(
    `SELECT DISTINCT backlog_item_id AS id FROM sge_pm_atividade_backlog WHERE atividade_id = ?
     UNION
     SELECT DISTINCT tb.backlog_item_id AS id FROM sge_pm_tarefa_backlog tb
     JOIN sge_pm_atividade_tarefa t ON t.id = tb.tarefa_id
     WHERE t.atividade_id = ?`,
    [atividadeId, atividadeId]
  );
  return backlogs.map((b) => b.id);
}
