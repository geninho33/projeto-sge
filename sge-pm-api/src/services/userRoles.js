import { hasMenuPermission } from "./profileService.js";

export function isAdmin(user) {
  return hasMenuPermission(user, "admin_usuarios", 1)
    || hasMenuPermission(user, "admin_perfis", 1)
    || hasMenuPermission(user, "projetos", 3);
}

export function canManageAtividadeTarefas(user, atividade) {
  if (!user?.id || !atividade) return false;
  return String(atividade.executor_id) === String(user.id);
}

export const MSG_TAREFA_SEM_PERMISSAO = "Apenas o executor da atividade pode cadastrar e gerenciar tarefas.";

export function hasPermission(permissoes, menuKey, minLevel = 1) {
  const nivel = permissoes?.[menuKey] ?? 0;
  return nivel >= minLevel;
}
