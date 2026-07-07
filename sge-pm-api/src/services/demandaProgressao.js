import { query, queryOne } from "../db.js";
import { FASE_ORDER } from "./demandaFlow.js";
import { FASES_DEMANDA } from "./schemaV4.js";

export const PROGRESSAO_FASES = FASES_DEMANDA.filter((f) => f !== "cancelada");

export function deriveFaseFromAtividades(atividades) {
  if (!atividades?.length) return "criacao";

  const pending = atividades.filter((a) => a.status !== "concluida");
  if (!pending.length) {
    let maxIdx = -1;
    let fase = "aprovacao";
    for (const a of atividades) {
      const idx = FASE_ORDER.indexOf(a.fase);
      if (idx > maxIdx && FASES_DEMANDA.includes(a.fase)) {
        maxIdx = idx;
        fase = a.fase;
      }
    }
    return fase;
  }

  let minIdx = 999;
  let fase = pending[0].fase || "criacao";
  for (const a of pending) {
    const idx = FASE_ORDER.indexOf(a.fase);
    if (idx >= 0 && idx < minIdx) {
      minIdx = idx;
      fase = a.fase;
    }
  }
  return FASES_DEMANDA.includes(fase) ? fase : "criacao";
}

export async function syncDemandaFaseFromAtividades(demandaId) {
  const demanda = await queryOne(
    `SELECT id, fase FROM sge_pm_demanda WHERE id = ? AND deleted_at IS NULL`,
    [demandaId]
  );
  if (!demanda || demanda.fase === "cancelada") return demanda?.fase ?? null;

  const atividades = await query(
    `SELECT fase, status FROM sge_pm_atividade WHERE demanda_id = ?`,
    [demandaId]
  );
  const derived = deriveFaseFromAtividades(atividades);
  if (derived !== demanda.fase) {
    await query(
      `UPDATE sge_pm_demanda SET fase = ?, updated_at = datetime('now') WHERE id = ?`,
      [derived, demandaId]
    );
  }
  return derived;
}

export async function resolveDemandaFase(demandaId, currentFase) {
  if (currentFase === "cancelada") return "cancelada";
  const atividades = await query(
    `SELECT fase, status FROM sge_pm_atividade WHERE demanda_id = ?`,
    [demandaId]
  );
  return deriveFaseFromAtividades(atividades);
}
