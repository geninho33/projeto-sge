/**
 * Valida o formulário de atividade e retorna erros por campo.
 * @returns {{ errors: Record<string, string>, tab: 'dados' | 'detalhes' | null }}
 */
export function validateAtividadeForm(form) {
  const errors = {};

  if (!form.titulo?.trim()) {
    errors.titulo = "Informe o título da atividade.";
  }
  if (!form.tipo_atividade_id) {
    errors.tipo_atividade_id = "Selecione o tipo de atividade.";
  }
  if (!form.fase) {
    errors.fase = "Selecione a fase.";
  }
  if (!form.data_prevista_termino) {
    errors.data_prevista_termino = "Informe o prazo previsto para término.";
  }
  if (!form.executor_id) {
    errors.executor_id = "Selecione o usuário executor.";
  }

  const firstKey = Object.keys(errors)[0];
  const tab = firstKey ? "dados" : null;

  return { errors, tab };
}

export function buildAtividadePayload(form, demandaId, demandaFase) {
  return {
    titulo: form.titulo.trim(),
    descricao: form.descricao?.trim() || null,
    tipo_atividade_id: Number(form.tipo_atividade_id),
    executor_id: Number(form.executor_id),
    fase: form.fase || demandaFase,
    data_prevista_termino: form.data_prevista_termino || null,
    demanda_id: Number(demandaId),
    backlog_item_ids: (form.backlog_item_ids || []).map(Number).filter(Boolean),
  };
}
