export const STATUS_TAREFA_LABEL = {
  aguardando: "Aguardando",
  em_andamento: "Em andamento",
  concluida: "Concluída",
};

export const STATUS_TAREFA_TONE = {
  aguardando: "neutral",
  em_andamento: "info",
  concluida: "success",
};

export function formatHoras(horas) {
  const h = Number(horas) || 0;
  if (h < 1) return `${Math.round(h * 60)}min`;
  const horasInt = Math.floor(h);
  const mins = Math.round((h - horasInt) * 60);
  return mins > 0 ? `${horasInt}h ${mins}min` : `${horasInt}h`;
}

export function formatTimer(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":");
}
