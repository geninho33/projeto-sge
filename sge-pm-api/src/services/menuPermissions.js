import { P, PERMISSION_ACTIONS } from "./permissionActions.js";

/**
 * Fonte única: estrutura do menu = estrutura de permissões.
 * Ao adicionar item aqui, ele aparece no gerenciamento de perfis e na navegação.
 */
export const MENU_STRUCTURE = [
  {
    grupo: "Principal",
    itens: [
      { key: "dashboard", label: "Dashboard", path: "/", end: true, icon: "◫" },
      { key: "demandas", label: "Demandas", path: "/demandas-flow", icon: "⇄" },
    ],
  },
  {
    grupo: "Dev",
    itens: [
      { key: "meu_kanban", label: "Atividades", path: "/meu-kanban", icon: "▣" },
      { key: "consulta_tarefas", label: "Consultar Tarefas", path: "/consulta/tarefas", icon: "☰" },
      { key: "consulta_apontamentos", label: "Horas Trabalhadas", path: "/consulta/apontamentos", icon: "⏱" },
    ],
  },
  {
    grupo: "Material de Apoio",
    itens: [
      { key: "kanban", label: "Kanban de Progressão", path: "/kanban", icon: "▦" },
      { key: "backlog", label: "Backlog", path: "/backlog", icon: "☰" },
      { key: "skills", label: "Skills", path: "/admin/skills", icon: "★" },
      { key: "demandas_legado", label: "Demandas (Legado)", path: "/demandas", icon: "⇄" },
    ],
  },
  {
    grupo: "Administração",
    itens: [
      { key: "projetos", label: "Projetos", path: "/projetos", icon: "◈" },
      { key: "admin_perfis", label: "Perfis de Usuários", path: "/admin/perfis", icon: "🔐" },
      { key: "admin_tipos", label: "Tipos de Atividade", path: "/admin/tipos-atividade", icon: "◆" },
      { key: "admin_usuarios", label: "Usuários", path: "/admin/usuarios", icon: "👤" },
      { key: "admin_migracoes", label: "Migrações", path: "/admin/migracoes", icon: "⬆" },
      { key: "admin_mapeamento", label: "Mapeamento", path: "/admin/mapeamento", icon: "⊞" },
    ],
  },
];

export const NIVEL_PERMISSAO = PERMISSION_ACTIONS.map(({ value, label }) => ({ value, label }));

const ALL_MENU_KEYS = MENU_STRUCTURE.flatMap((g) => g.itens.map((i) => i.key));

const FULL_ACCESS = Object.fromEntries(ALL_MENU_KEYS.map((k) => [k, P.ADMIN]));

/** Permissões padrão por perfil de sistema (codigo em sge_pm_perfil). */
export const DEFAULT_PROFILE_PERMISSIONS = {
  admin: { ...FULL_ACCESS },
  gestor_proj: { ...FULL_ACCESS },
  analista: {
    dashboard: P.VIEW,
    demandas: P.APPROVE,
    meu_kanban: P.VIEW,
    consulta_tarefas: P.VIEW,
    consulta_apontamentos: P.VIEW,
    kanban: P.VIEW,
    backlog: P.VIEW,
    skills: P.VIEW,
    demandas_legado: P.VIEW,
    projetos: P.VIEW,
    admin_perfis: P.NONE,
    admin_tipos: P.NONE,
    admin_usuarios: P.NONE,
    admin_migracoes: P.NONE,
    admin_mapeamento: P.NONE,
  },
  desenvolvedor: {
    dashboard: P.VIEW,
    demandas: P.VIEW,
    meu_kanban: P.DELETE,
    consulta_tarefas: P.VIEW,
    consulta_apontamentos: P.VIEW,
    kanban: P.VIEW,
    backlog: P.VIEW,
    skills: P.VIEW,
    demandas_legado: P.NONE,
    projetos: P.NONE,
    admin_perfis: P.NONE,
    admin_tipos: P.NONE,
    admin_usuarios: P.NONE,
    admin_migracoes: P.NONE,
    admin_mapeamento: P.NONE,
  },
  homologador: {
    dashboard: P.VIEW,
    demandas: P.APPROVE,
    meu_kanban: P.VIEW,
    consulta_tarefas: P.VIEW,
    consulta_apontamentos: P.VIEW,
    kanban: P.VIEW,
    backlog: P.VIEW,
    skills: P.VIEW,
    demandas_legado: P.NONE,
    projetos: P.NONE,
    admin_perfis: P.NONE,
    admin_tipos: P.NONE,
    admin_usuarios: P.NONE,
    admin_migracoes: P.NONE,
    admin_mapeamento: P.NONE,
  },
  consultor: Object.fromEntries(ALL_MENU_KEYS.map((k) => [k, k.startsWith("admin_") || k === "projetos" ? P.NONE : P.VIEW])),
};

export function flattenMenuKeys() {
  return [...ALL_MENU_KEYS];
}

export function getMenuItem(key) {
  for (const grupo of MENU_STRUCTURE) {
    const item = grupo.itens.find((i) => i.key === key);
    if (item) return { ...item, grupo: grupo.grupo };
  }
  return null;
}

export function hasPermission(permissoes, menuKey, minLevel = P.VIEW) {
  const nivel = Number(permissoes?.[menuKey] ?? 0);
  return nivel >= minLevel;
}

export function getMenuPayload() {
  return {
    structure: MENU_STRUCTURE,
    niveis: NIVEL_PERMISSAO,
    actions: PERMISSION_ACTIONS,
    keys: flattenMenuKeys(),
  };
}

export { P, PERMISSION_ACTIONS };
