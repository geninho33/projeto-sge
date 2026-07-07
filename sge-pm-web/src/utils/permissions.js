/** Níveis hierárquicos — espelham o backend (permissionActions.js). */
export const P = {
  NONE: 0,
  VIEW: 1,
  CREATE: 2,
  UPDATE: 3,
  DELETE: 4,
  APPROVE: 5,
  ADMIN: 6,
};

export const PERMISSION_ACTIONS = [
  { value: P.NONE, label: "Sem acesso", short: "Nenhum" },
  { value: P.VIEW, label: "Somente consulta", short: "Ver menu e telas" },
  { value: P.CREATE, label: "Inclusão", short: "Criar registros" },
  { value: P.UPDATE, label: "Alteração", short: "Editar registros" },
  { value: P.DELETE, label: "Exclusão", short: "Excluir registros" },
  { value: P.APPROVE, label: "Aprovação", short: "Aprovar / tramitar" },
  { value: P.ADMIN, label: "Administração total", short: "Controle completo" },
];

const ALL_MENU_KEYS = [
  "dashboard", "demandas", "meu_kanban", "consulta_tarefas", "consulta_apontamentos",
  "kanban", "backlog", "skills", "demandas_legado", "projetos",
  "admin_perfis", "admin_tipos", "admin_usuarios", "admin_migracoes", "admin_mapeamento",
];

const PROFILE_DEFAULTS = {
  admin: Object.fromEntries(ALL_MENU_KEYS.map((k) => [k, P.ADMIN])),
  gestor_proj: Object.fromEntries(ALL_MENU_KEYS.map((k) => [k, P.ADMIN])),
  desenvolvedor: {
    dashboard: P.VIEW, demandas: P.VIEW, meu_kanban: P.DELETE,
    consulta_tarefas: P.VIEW, consulta_apontamentos: P.VIEW,
    kanban: P.VIEW, backlog: P.VIEW, skills: P.VIEW, demandas_legado: P.NONE,
    projetos: P.NONE, admin_perfis: P.NONE, admin_tipos: P.NONE,
    admin_usuarios: P.NONE, admin_migracoes: P.NONE, admin_mapeamento: P.NONE,
  },
};

export function hasPermission(permissoes, menuKey, minLevel = P.VIEW) {
  return Number(permissoes?.[menuKey] ?? 0) >= minLevel;
}

export function getEffectivePermissions(user) {
  const fromApi = user?.permissoes;
  if (fromApi && Object.keys(fromApi).length > 0) return fromApi;

  const perfis = user?.perfisArr || user?.perfis || [];
  const codes = [...(Array.isArray(perfis) ? perfis : []), user?.perfil].filter(Boolean);
  const merged = {};
  for (const code of codes) {
    const defaults = PROFILE_DEFAULTS[code];
    if (!defaults) continue;
    for (const [key, nivel] of Object.entries(defaults)) {
      merged[key] = Math.max(merged[key] ?? 0, nivel);
    }
  }
  return merged;
}

export function can(user, menuKey, minLevel = P.VIEW) {
  return hasPermission(getEffectivePermissions(user), menuKey, minLevel);
}

export function isAdmin(user) {
  const perfis = user?.perfisArr || user?.perfis || [];
  const allPerfis = [...(Array.isArray(perfis) ? perfis : []), user?.perfil].filter(Boolean);
  if (allPerfis.some((p) => ["admin", "gestor_proj"].includes(p))) return true;
  const permissoes = getEffectivePermissions(user);
  return hasPermission(permissoes, "admin_usuarios", P.VIEW)
    || hasPermission(permissoes, "admin_perfis", P.VIEW)
    || hasPermission(permissoes, "projetos", P.UPDATE);
}

export function nivelLabel(nivel) {
  return PERMISSION_ACTIONS.find((a) => a.value === nivel)?.label ?? "Sem acesso";
}

export function canManageAtividadeTarefas(user, atividade) {
  if (!user?.id || !atividade) return false;
  if (can(user, "meu_kanban", P.ADMIN)) return true;
  return String(atividade.executor_id) === String(user.id);
}

export const MSG_TAREFA_SEM_PERMISSAO = "Apenas o executor da atividade pode cadastrar e gerenciar tarefas.";
