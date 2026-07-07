import { query, queryOne } from "../db.js";
import {
  computeStatusAtividadeFromTarefas,
  computePercentualAtividade,
  getTarefasEnriched,
  recalcAtividadeFromTarefas,
} from "./tarefaStatus.js";

export const STATUS_ATIVIDADE = ["aguardando", "em_andamento", "concluida"];

export function computeStatusFromTarefas(tarefas) {
  return computeStatusAtividadeFromTarefas(tarefas);
}

export function computePercentual(tarefas) {
  return computePercentualAtividade(tarefas);
}

export async function getTarefas(atividadeId) {
  return getTarefasEnriched(atividadeId);
}

export async function recalcAtividadeStatus(atividadeId) {
  return recalcAtividadeFromTarefas(atividadeId);
}
