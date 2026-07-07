import { useEffect, useState } from "react";
import { apiJson } from "../../api/client";
import { Modal } from "../ui/Modal";
import { Input, Textarea } from "../ui/Input";
import { Button } from "../ui/Button";
import { Alert } from "../ui/Alert";

export function ApontamentoModal({ open, tarefa, atividadeId, onClose, onSaved, onError }) {
  const [horas, setHoras] = useState("");
  const [obs, setObs] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) { setHoras(""); setObs(""); setError(null); }
  }, [open]);

  const registrar = async () => {
    const val = Number(String(horas).replace(",", "."));
    if (!Number.isFinite(val) || val <= 0) {
      setError("Informe uma quantidade de horas válida.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const r = await apiJson(`/atividades/${atividadeId}/tarefas/${tarefa.id}/apontamento`, {
        method: "POST",
        body: JSON.stringify({ quantidade_horas: val, comentario: obs || null }),
      });
      onSaved?.(r.data);
      setHoras("");
      setObs("");
      onClose();
    } catch (e) {
      setError(e.message);
      onError?.(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!open || !tarefa) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Apontar Horas"
      size="sm"
      compact
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>Fechar</Button>
          <Button size="sm" onClick={registrar} loading={saving}>Registrar</Button>
        </>
      }
    >
      <div className="apontar-modal">
        <p className="apontar-modal__task" title={tarefa.titulo}>{tarefa.titulo}</p>
        {error && <Alert type="error">{error}</Alert>}
        <Input
          label="Quantidade de horas"
          type="number"
          min="0.25"
          step="0.25"
          placeholder="Ex.: 2 ou 1.5"
          value={horas}
          onChange={(e) => setHoras(e.target.value)}
          autoFocus
        />
        <Textarea
          label="Observação (opcional)"
          rows={2}
          value={obs}
          onChange={(e) => setObs(e.target.value)}
          placeholder="O que foi realizado..."
        />
        <p className="apontar-modal__hint">Data registrada automaticamente como hoje.</p>
      </div>
    </Modal>
  );
}
