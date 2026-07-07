const PRIORITY = {
  P1: "danger",
  P2: "warning",
  P3: "success",
  alta: "danger",
  media: "warning",
  baixa: "success",
};

const STATUS = {
  ativo: "success",
  inativo: "neutral",
  planejada: "info",
  em_andamento: "info",
  concluida: "success",
  concluido: "success",
  backlog: "neutral",
  a_fazer: "info",
  em_desenvolvimento: "info",
  em_revisao: "warning",
  em_testes: "warning",
  homologacao: "warning",
  nao_iniciada: "neutral",
  aguardando: "neutral",
  aguardando_revisao: "warning",
  bloqueada: "danger",
  running: "success",
  paused: "warning",
};

export function Badge({ children, tone, className = "" }) {
  const variant = tone || "neutral";
  return <span className={`ui-badge ui-badge--${variant} ${className}`.trim()}>{children}</span>;
}

export function PriorityBadge({ value }) {
  return <Badge tone={PRIORITY[value] || "neutral"}>{value}</Badge>;
}

export function StatusBadge({ value, label }) {
  return <Badge tone={STATUS[value] || "neutral"}>{label || value}</Badge>;
}
