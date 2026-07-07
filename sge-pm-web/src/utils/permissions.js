export function hasPermission(permissoes, menuKey, minLevel = 1) {
  const nivel = permissoes?.[menuKey] ?? 0;
  return nivel >= minLevel;
}

export function isAdmin(user) {
  return hasPermission(user?.permissoes, "admin_usuarios", 1)
    || hasPermission(user?.permissoes, "admin_perfis", 1)
    || hasPermission(user?.permissoes, "projetos", 3);
}

export function canManageAtividadeTarefas(user, atividade) {
  if (!user?.id || !atividade) return false;
  return String(atividade.executor_id) === String(user.id);
}

export const MSG_TAREFA_SEM_PERMISSAO = "Apenas o executor da atividade pode cadastrar e gerenciar tarefas.";
