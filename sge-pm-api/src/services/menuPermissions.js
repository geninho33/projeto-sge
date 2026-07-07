/**
 * Estrutura de menus alinhada à navegação do AppShell (App.jsx / AppShell.jsx).
 */
export const MENU_STRUCTURE = [
  {
    grupo: "Principal",
    itens: [
      { key: "dashboard", label: "Dashboard" },
      { key: "demandas", label: "Demandas" },
    ],
  },
  {
    grupo: "Dev",
    itens: [
      { key: "meu_kanban", label: "Atividades" },
      { key: "consulta_tarefas", label: "Consultar Tarefas" },
      { key: "consulta_apontamentos", label: "Horas Trabalhadas" },
    ],
  },
  {
    grupo: "Material de Apoio",
    itens: [
      { key: "kanban", label: "Kanban de Progressão" },
      { key: "backlog", label: "Backlog" },
      { key: "skills", label: "Skills" },
      { key: "demandas_legado", label: "Demandas (Legado)" },
    ],
  },
  {
    grupo: "Administração",
    itens: [
      { key: "projetos", label: "Projetos" },
      { key: "admin_perfis", label: "Perfis de Usuários" },
      { key: "admin_tipos", label: "Tipos de Atividade" },
      { key: "admin_usuarios", label: "Usuários" },
      { key: "admin_migracoes", label: "Migrações" },
      { key: "admin_mapeamento", label: "Mapeamento" },
    ],
  },
];

export const NIVEL_PERMISSAO = [
  { value: 0, label: "Sem acesso" },
  { value: 1, label: "Somente consulta" },
  { value: 2, label: "Inclusão" },
  { value: 3, label: "Alteração" },
  { value: 4, label: "Exclusão" },
  { value: 5, label: "Aprovação" },
  { value: 6, label: "Administração total" },
];

const ALL_MENU_KEYS = MENU_STRUCTURE.flatMap((g) => g.itens.map((i) => i.key));

/** Permissões padrão por perfil de sistema (codigo em sge_pm_perfil). */
export const DEFAULT_PROFILE_PERMISSIONS = {
  gestor_proj: Object.fromEntries(ALL_MENU_KEYS.map((k) => [k, 6])),
  desenvolvedor: {
    dashboard: 1,
    demandas: 1,
    meu_kanban: 4,
    consulta_tarefas: 1,
    consulta_apontamentos: 1,
    kanban: 1,
    backlog: 1,
    skills: 1,
    demandas_legado: 0,
    projetos: 0,
    admin_perfis: 0,
    admin_tipos: 0,
    admin_usuarios: 0,
    admin_migracoes: 0,
    admin_mapeamento: 0,
  },
};

export function flattenMenuKeys() {
  return [...ALL_MENU_KEYS];
}

export function hasPermission(permissoes, menuKey, minLevel = 1) {
  const nivel = permissoes?.[menuKey] ?? 0;
  return nivel >= minLevel;
}
