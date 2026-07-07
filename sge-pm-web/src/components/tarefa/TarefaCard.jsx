import { StatusBadge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { STATUS_TAREFA_LABEL } from "../../constants/tarefa";
import { formatHoras } from "../../constants/tarefa";

export function TarefaCard({ tarefa, onEdit, onConcluir }) {
  const status = tarefa.status || (tarefa.concluida ? "concluida" : "aguardando");
  const progress = status === "concluida" ? 100 : status === "em_andamento" ? 50 : 0;

  return (
    <article className={`tarefa-card tarefa-card--${status}`}>
      <header className="tarefa-card__header">
        <div>
          <h4 className="tarefa-card__title">{tarefa.titulo}</h4>
          {tarefa.tipo_nome && (
            <span className="tarefa-card__tipo" style={{ borderColor: tarefa.tipo_cor || "#1E6FD9" }}>
              {tarefa.tipo_nome}
            </span>
          )}
        </div>
        <StatusBadge value={status} label={STATUS_TAREFA_LABEL[status] || status} />
      </header>

      <dl className="tarefa-card__meta">
        <div>
          <dt>Executor</dt>
          <dd>{tarefa.executor_nome || "—"}</dd>
        </div>
        <div>
          <dt>Prazo</dt>
          <dd>{tarefa.data_prevista_termino?.slice(0, 10) || "—"}</dd>
        </div>
        <div>
          <dt>Horas</dt>
          <dd>{formatHoras(tarefa.horas_apontadas)}</dd>
        </div>
      </dl>

      <div className="progress-bar tarefa-card__progress">
        <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
      </div>

      {(onEdit || onConcluir) && (
        <footer className="tarefa-card__actions">
          {onEdit && <Button size="sm" variant="ghost" onClick={() => onEdit(tarefa)}>Gerenciar</Button>}
          {onConcluir && status !== "concluida" && (
            <Button size="sm" variant="ghost" onClick={() => onConcluir(tarefa)}>Concluir</Button>
          )}
        </footer>
      )}
    </article>
  );
}
