/**
 * Níveis de permissão — hierárquicos (nível N implica acesso aos níveis menores).
 * 0 Sem acesso | 1 Consulta | 2 Inclusão | 3 Alteração | 4 Exclusão | 5 Aprovação | 6 Admin total
 */
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
  { value: P.NONE, label: "Sem acesso", short: "—" },
  { value: P.VIEW, label: "Somente consulta", short: "Ver menu e telas" },
  { value: P.CREATE, label: "Inclusão", short: "Criar registros" },
  { value: P.UPDATE, label: "Alteração", short: "Editar registros" },
  { value: P.DELETE, label: "Exclusão", short: "Excluir registros" },
  { value: P.APPROVE, label: "Aprovação", short: "Aprovar / tramitar" },
  { value: P.ADMIN, label: "Administração total", short: "Controle completo" },
];
