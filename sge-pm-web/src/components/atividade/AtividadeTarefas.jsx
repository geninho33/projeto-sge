import { useEffect, useState } from "react";
import { apiJson } from "../../api/client";
import { canManageAtividadeTarefas, MSG_TAREFA_SEM_PERMISSAO } from "../../utils/permissions";

export function AtividadeTarefas({ atividadeId, atividade, userId, tarefas: initial, onUpdate, onError }) {
  const [tarefas, setTarefas] = useState(initial || []);
  const [nova, setNova] = useState("");
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState(null);

  const canManage = canManageAtividadeTarefas({ id: userId }, atividade);

  useEffect(() => { setTarefas(initial || []); }, [initial]);

  const handleError = (e, action) => {
    const msg = e?.message?.includes("Not Found")
      ? "Não foi possível salvar a tarefa. Reinicie a API (versão 4+) ou verifique se a atividade existe."
      : (e?.message || `Falha ao ${action} a tarefa.`);
    setLocalError(msg);
    onError?.(msg);
    console.error(`[AtividadeTarefas] Erro ao ${action}:`, e);
  };

  const toggle = async (t) => {
    if (!canManage) {
      setLocalError(MSG_TAREFA_SEM_PERMISSAO);
      return;
    }
    setSaving(true);
    setLocalError(null);
    try {
      const r = await apiJson(`/atividades/${atividadeId}/tarefas/${t.id}`, {
        method: "PUT",
        body: JSON.stringify({ concluida: !t.concluida }),
      });
      if (r.data.tarefas) setTarefas(r.data.tarefas);
      else setTarefas((prev) => prev.map((x) => (x.id === t.id ? r.data.tarefa : x)));
      onUpdate?.(r.data);
    } catch (e) {
      handleError(e, "atualizar");
    } finally {
      setSaving(false);
    }
  };

  const add = async () => {
    if (!canManage) {
      setLocalError(MSG_TAREFA_SEM_PERMISSAO);
      return;
    }
    if (!nova.trim()) {
      setLocalError("Informe o título da tarefa.");
      return;
    }
    setSaving(true);
    setLocalError(null);
    try {
      const r = await apiJson(`/atividades/${atividadeId}/tarefas`, {
        method: "POST",
        body: JSON.stringify({ titulo: nova.trim() }),
      });
      setTarefas(r.data.tarefas || [...tarefas, r.data.tarefa]);
      setNova("");
      onUpdate?.(r.data);
    } catch (e) {
      handleError(e, "criar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="atividade-tarefas">
      <span className="ui-field__label">Tarefas</span>
      {localError && <p className="ui-field__error atividade-tarefas__error">{localError}</p>}
      <ul className="atividade-tarefas__list">
        {tarefas.map((t) => (
          <li key={t.id} className={t.concluida ? "done" : ""}>
            <label>
              <input type="checkbox" checked={!!t.concluida} disabled={saving || !canManage} onChange={() => toggle(t)} />
              <span>{t.titulo}</span>
            </label>
          </li>
        ))}
        {tarefas.length === 0 && <li className="atividade-tarefas__empty">Nenhuma tarefa — status: Aguardando</li>}
      </ul>
      {canManage ? (
        <div className="atividade-tarefas__add">
          <input
            className="ui-input"
            placeholder="Nova tarefa..."
            value={nova}
            onChange={(e) => setNova(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          />
          <button type="button" className="ui-btn ui-btn--sm ui-btn--ghost" disabled={saving} onClick={add}>+</button>
        </div>
      ) : (
        <p className="text-muted atividade-tarefas__hint">Somente o executor da atividade pode cadastrar tarefas.</p>
      )}
    </div>
  );
}
