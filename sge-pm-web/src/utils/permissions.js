export function isAdmin(user) {
  const perfis = user?.perfisArr || user?.perfis || [];
  const all = [...(Array.isArray(perfis) ? perfis : []), user?.perfil].filter(Boolean);
  return all.includes("gestor") || all.includes("tech_lead");
}

export function canManageAtividadeTarefas(user, atividade) {
  if (!user?.id || !atividade) return false;
  return String(atividade.executor_id) === String(user.id);
}

export const MSG_TAREFA_SEM_PERMISSAO = "Apenas o executor da atividade pode cadastrar e gerenciar tarefas.";
