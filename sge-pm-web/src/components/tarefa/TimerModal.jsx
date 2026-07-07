import { useEffect, useRef, useState } from "react";
import { apiJson } from "../../api/client";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Alert } from "../ui/Alert";
import { formatTimer, formatHoras } from "../../constants/tarefa";

export function TimerModal({ open, tarefa, atividadeId, timerAtivo, onClose, onUpdate, onError, onOpenTarefa }) {
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isThisTask = timerAtivo?.tarefa_id === tarefa?.id;
  const running = isThisTask && timerAtivo?.status === "running";
  const paused = isThisTask && timerAtivo?.status === "paused";
  const active = running || paused;

  useEffect(() => {
    if (!isThisTask) { setElapsed(0); return; }
    setElapsed(timerAtivo?.elapsed_seconds || 0);
  }, [timerAtivo, isThisTask]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const call = async (action, body) => {
    setLoading(true);
    setError(null);
    try {
      const r = await apiJson(`/atividades/${atividadeId}/tarefas/${tarefa.id}/timer/${action}`, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
      });
      onUpdate?.(r.data);
    } catch (e) {
      setError(e.message);
      onError?.(e.message);
    } finally {
      setLoading(false);
    }
  };

  const zerarSessao = async () => {
    setMenuOpen(false);
    if (active) await call("stop", { comentario: "", descartar: true });
    setElapsed(0);
  };

  const encerrarSessao = async () => {
    setMenuOpen(false);
    await call("stop", { comentario: "" });
  };

  if (!open || !tarefa) return null;

  const statusLabel = running ? "Em execução" : paused ? "Pausado" : "Parado";
  const statusClass = running ? "timer-modal__status-label--running" : paused ? "timer-modal__status-label--paused" : "";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cronômetro"
      size="sm"
      compact
      footer={
        <>
          {onOpenTarefa && (
            <Button variant="ghost" size="sm" onClick={() => { onClose(); onOpenTarefa(tarefa); }}>
              Abrir Tarefa
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>Fechar</Button>
        </>
      }
    >
      <div className="timer-modal">
        {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}

        <div className="timer-modal__top">
          <p className="timer-modal__task-name" title={tarefa.titulo}>{tarefa.titulo}</p>
          <div className="timer-modal__menu-wrap" ref={menuRef}>
            <button type="button" className="timer-modal__dots" onClick={() => setMenuOpen(!menuOpen)} title="Opções">⋯</button>
            {menuOpen && (
              <div className="timer-modal__dropdown">
                <button type="button" className="timer-modal__dropdown-item" onClick={zerarSessao}>Zerar Sessão</button>
                <button type="button" className="timer-modal__dropdown-item timer-modal__dropdown-item--danger" onClick={encerrarSessao}>Encerrar Sessão</button>
              </div>
            )}
          </div>
        </div>

        <div className="timer-modal__meta">
          <span className="text-muted">Acumulado: <strong>{formatHoras(tarefa.horas_apontadas)}</strong></span>
          <span className={`timer-modal__status-label ${statusClass}`}>{statusLabel}</span>
        </div>

        <div className={`timer-modal__clock${running ? " timer-modal__clock--running" : ""}`}>
          <span className="timer-modal__time">{formatTimer(elapsed)}</span>
          {running && <span className="timer-modal__pulse" />}
        </div>

        <div className="timer-modal__actions">
          {!active && (
            <Button size="sm" loading={loading} onClick={() => call("start")}>▶ Iniciar</Button>
          )}
          {running && (
            <>
              <Button size="sm" variant="ghost" loading={loading} onClick={() => call("pause")}>⏸ Pausar</Button>
              <Button size="sm" loading={loading} onClick={encerrarSessao}>⏹ Encerrar e Registrar</Button>
            </>
          )}
          {paused && (
            <>
              <Button size="sm" loading={loading} onClick={() => call("resume")}>▶ Retomar</Button>
              <Button size="sm" variant="ghost" loading={loading} onClick={encerrarSessao}>⏹ Encerrar e Registrar</Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
