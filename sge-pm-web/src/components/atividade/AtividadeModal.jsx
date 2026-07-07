import { useCallback, useEffect, useState } from "react";
import { apiJson } from "../../api/client";
import { Modal } from "../ui/Modal";
import { EditModalFooter } from "../ui/EditModalFooter";
import { Alert } from "../ui/Alert";
import { AtividadeForm, AtividadeFormAlert } from "./AtividadeForm";
import { buildAtividadePayload, validateAtividadeForm } from "./atividadeFormUtils";

function emptyForm(demanda, userId, tipos) {
  return {
    titulo: "",
    tipo_atividade_id: tipos[0]?.id || "",
    executor_id: userId || "",
    fase: demanda.fase,
    projeto_id: demanda.projeto_id,
    backlog_item_ids: [],
    data_prevista_termino: "",
    descricao: "",
  };
}

function fromAtividade(atividade, demanda) {
  return {
    id: atividade.id,
    titulo: atividade.titulo || "",
    tipo_atividade_id: atividade.tipo_atividade_id,
    executor_id: atividade.executor_id,
    fase: atividade.fase || demanda.fase,
    projeto_id: atividade.projeto_id || demanda.projeto_id,
    backlog_item_ids: atividade.backlogs?.map((b) => b.id) || [],
    data_prevista_termino: atividade.data_prevista_termino || "",
    descricao: atividade.descricao || "",
  };
}

export function AtividadeModal({
  open,
  initial,
  demanda,
  demandaId,
  userId,
  tipos,
  usuarios,
  projetos,
  backlogs,
  onClose,
  onSaved,
  onError,
}) {
  const [form, setForm] = useState(null);
  const [activeTab, setActiveTab] = useState("dados");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setApiError(null);
    setActiveTab("dados");
    if (initial?.id) {
      setForm(fromAtividade(initial, demanda));
    } else {
      setForm(emptyForm(demanda, userId, tipos));
    }
  }, [open, initial, demanda, userId, tipos]);

  const save = useCallback(async () => {
    if (!form) return;

    const { errors: validationErrors, tab } = validateAtividadeForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      if (tab) setActiveTab(tab);
      setApiError(null);
      return;
    }

    setErrors({});
    setApiError(null);
    setSaving(true);

    const payload = buildAtividadePayload(form, demandaId, demanda.fase);
    const isEdit = Boolean(form.id);

    try {
      if (isEdit) {
        await apiJson(`/atividades/${form.id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiJson("/atividades", { method: "POST", body: JSON.stringify(payload) });
      }
      onSaved?.(isEdit ? "Atividade atualizada com sucesso." : "Atividade criada com sucesso.");
      onClose();
    } catch (e) {
      const msg = e.message || "Não foi possível salvar a atividade. Verifique os dados e tente novamente.";
      setApiError(msg);
      onError?.(msg);
      console.error("[AtividadeModal] Falha ao salvar atividade:", { payload, error: e });
    } finally {
      setSaving(false);
    }
  }, [form, demandaId, demanda.fase, onClose, onSaved, onError]);

  if (!open || !form) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={form.id ? "Editar Atividade" : "Nova Atividade"}
      size="full"
      footer={(
        <EditModalFooter
          onCancel={onClose}
          onSave={save}
          saving={saving}
          showSaveContinue={false}
        />
      )}
    >
      <div className="atividade-modal__body">
        {(apiError || Object.keys(errors).length > 0) && (
          <div className="atividade-modal__alerts">
            <AtividadeFormAlert errors={errors} />
            {apiError && <Alert type="error">{apiError}</Alert>}
          </div>
        )}
        <AtividadeForm
          form={form}
          setForm={setForm}
          projetos={projetos}
          tipos={tipos}
          usuarios={usuarios}
          backlogs={backlogs}
          projetoId={demanda.projeto_id}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          errors={errors}
        />
      </div>
    </Modal>
  );
}
