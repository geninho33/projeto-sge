import { useEffect, useState } from "react";
import { apiJson } from "../../api/client";
import { Button } from "../ui/Button";
import { TarefaCard } from "./TarefaCard";
import { TarefaModal } from "./TarefaModal";
import { canManageAtividadeTarefas, MSG_TAREFA_SEM_PERMISSAO } from "../../utils/permissions";

export function TarefasPanel({
  atividadeId,
  atividade,
  tarefas: initial,
  usuarios,
  userId,
  onUpdate,
  onError,
}) {
  const [tarefas, setTarefas] = useState(initial || []);
  const [modal, setModal] = useState(null);
  const [timerAtivo, setTimerAtivo] = useState(null);

  const canManage = canManageAtividadeTarefas({ id: userId }, atividade);

  useEffect(() => { setTarefas(initial || []); }, [initial]);

  useEffect(() => {
    apiJson("/timer/tarefa/ativo").then((r) => setTimerAtivo(r.data)).catch(() => {});
  }, []);

  const applyUpdate = (data) => {
    if (data.tarefas) setTarefas(data.tarefas);
    else if (data.tarefa) {
      setTarefas((prev) => {
        const idx = prev.findIndex((t) => t.id === data.tarefa.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = data.tarefa;
          return next;
        }
        return [...prev, data.tarefa];
      });
    }
    if (data.timer !== undefined) setTimerAtivo(data.timer);
    onUpdate?.(data);
  };

  const concluir = async (t) => {
    try {
      const r = await apiJson(`/atividades/${atividadeId}/tarefas/${t.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "concluida" }),
      });
      applyUpdate(r.data);
    } catch (e) {
      onError?.(e.message);
    }
  };

  const openCreate = () => {
    if (!canManage) {
      onError?.(MSG_TAREFA_SEM_PERMISSAO);
      return;
    }
    setModal({ mode: "create" });
  };

  return (
    <div className="tarefas-panel">
      <div className="tarefas-panel__head">
        <span className="ui-field__label">Tarefas</span>
        {canManage ? (
          <Button size="sm" variant="ghost" onClick={openCreate}>+ Nova tarefa</Button>
        ) : (
          <small className="text-muted">Somente o executor pode gerenciar</small>
        )}
      </div>

      <div className="tarefas-panel__grid">
        {tarefas.map((t) => (
          <TarefaCard
            key={t.id}
            tarefa={t}
            onEdit={canManage ? () => setModal({ mode: "edit", tarefa: t }) : undefined}
            onConcluir={canManage ? concluir : undefined}
          />
        ))}
        {tarefas.length === 0 && (
          <p className="tarefas-panel__empty">Nenhuma tarefa — a atividade permanece em Aguardando.</p>
        )}
      </div>

      <TarefaModal
        open={!!modal}
        tarefa={modal?.mode === "edit" ? modal.tarefa : null}
        atividadeId={atividadeId}
        userId={userId}
        usuarios={usuarios}
        timerAtivo={timerAtivo}
        onClose={() => setModal(null)}
        onSaved={applyUpdate}
        onError={onError}
      />
    </div>
  );
}
