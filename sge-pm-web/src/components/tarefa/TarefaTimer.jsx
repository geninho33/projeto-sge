import { useEffect, useState } from "react";
import { apiJson } from "../../api/client";
import { Button } from "../ui/Button";
import { formatTimer } from "../../constants/tarefa";

export function TarefaTimer({ atividadeId, tarefaId, timerAtivo, onUpdate, onError }) {
  const [elapsed, setElapsed] = useState(timerAtivo?.elapsed_seconds || 0);
  const [loading, setLoading] = useState(false);
  const isThisTask = timerAtivo?.tarefa_id === tarefaId;
  const running = isThisTask && timerAtivo?.status === "running";
  const paused = isThisTask && timerAtivo?.status === "paused";

  useEffect(() => {
    if (!isThisTask) {
      setElapsed(0);
      return;
    }
    setElapsed(timerAtivo?.elapsed_seconds || 0);
  }, [timerAtivo, isThisTask]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const call = async (action, body) => {
    setLoading(true);
    try {
      const r = await apiJson(`/atividades/${atividadeId}/tarefas/${tarefaId}/timer/${action}`, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
      });
      onUpdate?.(r.data);
    } catch (e) {
      onError?.(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`tarefa-timer${running ? " tarefa-timer--running" : ""}`}>
      <div className="tarefa-timer__display" aria-live="polite">
        <span className="tarefa-timer__time">{formatTimer(elapsed)}</span>
        {running && <span className="tarefa-timer__pulse" />}
      </div>
      <div className="tarefa-timer__actions">
        {!isThisTask && (
          <Button size="sm" loading={loading} onClick={() => call("start")}>Iniciar</Button>
        )}
        {running && (
          <Button size="sm" variant="ghost" loading={loading} onClick={() => call("pause")}>Pausar</Button>
        )}
        {paused && (
          <>
            <Button size="sm" loading={loading} onClick={() => call("resume")}>Continuar</Button>
            <Button size="sm" variant="ghost" loading={loading} onClick={() => call("stop", { comentario: "" })}>Encerrar</Button>
          </>
        )}
        {isThisTask && running && (
          <Button size="sm" variant="ghost" loading={loading} onClick={() => call("stop", { comentario: "" })}>Encerrar</Button>
        )}
      </div>
    </div>
  );
}
