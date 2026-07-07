export const MENU_STRUCTURE = [
  {
    grupo: "Principal",
    itens: [
      { key: "dashboard", label: "Dashboard" },
      { key: "minhas_demandas", label: "Minhas Demandas" },
      { key: "meu_kanban", label: "Atividades" },
      { key: "demandas", label: "Demandas" },
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

// Sprints (key: sprints) desativado na navegação — implementação mantida em /sprints

export const NIVEL_PERMISSAO = [
  { value: 0, label: "Sem acesso" },
  { value: 1, label: "Somente consulta" },
  { value: 2, label: "Inclusão" },
  { value: 3, label: "Alteração" },
  { value: 4, label: "Exclusão" },
  { value: 5, label: "Aprovação" },
  { value: 6, label: "Administração total" },
];

export function flattenMenuKeys() {
  return MENU_STRUCTURE.flatMap((g) => g.itens.map((i) => i.key));
}

export function hasPermission(permissoes, menuKey, minLevel = 1) {
  const nivel = permissoes?.[menuKey] ?? 0;
  return nivel >= minLevel;
}
