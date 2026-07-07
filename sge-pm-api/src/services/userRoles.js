import { getProfileCodesFromUser, hasMenuPermission } from "./profileService.js";
import { P } from "./menuPermissions.js";

export function isAdmin(user) {
  if (getProfileCodesFromUser(user).some((p) => ["admin", "gestor_proj"].includes(p))) return true;
  return hasMenuPermission(user, "admin_usuarios", P.VIEW)
    || hasMenuPermission(user, "admin_perfis", P.VIEW)
    || hasMenuPermission(user, "projetos", P.UPDATE);
}

/** @deprecated use isAdmin */
export const isAdminUser = isAdmin;

export function canManageAtividadeTarefas(user, atividade) {
  if (!user?.id || !atividade) return false;
  if (hasMenuPermission(user, "meu_kanban", P.ADMIN)) return true;
  return String(atividade.executor_id) === String(user.id);
}

export const MSG_TAREFA_SEM_PERMISSAO = "Apenas o executor da atividade pode cadastrar e gerenciar tarefas.";
