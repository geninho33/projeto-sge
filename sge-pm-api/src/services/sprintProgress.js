import { query } from "../db.js";
import { KANBAN_COLUMNS } from "./schemaV2.js";

export async function recalcSprintProgress(sprintId) {
  const rows = await query(
    `SELECT kanban_status, COUNT(*) AS c FROM sge_pm_backlog_item WHERE sprint_id = ? GROUP BY kanban_status`,
    [sprintId]
  );
  let total = 0;
  let done = 0;
  for (const r of rows) {
    total += r.c;
    if (r.kanban_status === "concluido") done += r.c;
  }
  const percentual = total ? Math.round((done / total) * 100) : 0;
  await query(`UPDATE sge_pm_sprint SET percentual_conclusao = ? WHERE id = ?`, [percentual, sprintId]);
  return percentual;
}

export { KANBAN_COLUMNS };
