import { useEffect, useState } from "react";
import { apiJson } from "../../api/client";
import { Modal } from "../ui/Modal";
import { EditModalFooter } from "../ui/EditModalFooter";
import { Input, Select, Textarea } from "../ui/Input";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { STATUS_TAREFA_LABEL } from "../../constants/tarefa";

const STATUS_OPTIONS = ["aguardando", "em_andamento", "concluida"];

function emptyForm() {
  return {
    titulo: "",
    data_inicio: new Date().toISOString().slice(0, 10),
    status: "aguardando",
    descricao: "",
    links: [{ titulo: "", url: "" }],
    prompt_ia: "",
    comando_branch: "",
  };
}

export function TarefaModal({
  open,
  tarefa,
  atividadeId,
  userId,
  usuarios,
  timerAtivo,
  onClose,
  onSaved,
  onError,
}) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setApiError(null);
    if (tarefa?.id) {
      setForm({
        id: tarefa.id,
        titulo: tarefa.titulo || "",
        data_inicio: tarefa.data_inicio || tarefa.created_at?.slice(0, 10) || "",
        status: tarefa.status || (tarefa.concluida ? "concluida" : "aguardando"),
        descricao: tarefa.descricao || "",
        links: tarefa.links?.length ? tarefa.links : [{ titulo: "", url: "" }],
        prompt_ia: tarefa.prompt_ia || "",
        comando_branch: tarefa.comando_branch || "",
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, tarefa]);

  const save = async () => {
    if (!form?.titulo?.trim()) {
      setApiError("Informe o nome da tarefa.");
      return;
    }
    setSaving(true);
    setApiError(null);
    try {
      const payload = {
        titulo: form.titulo.trim(),
        data_inicio: form.data_inicio || null,
        descricao: form.descricao || null,
        links: form.links.filter((l) => l.titulo && l.url),
        prompt_ia: form.prompt_ia || null,
        comando_branch: form.comando_branch || null,
      };
      if (form.id) payload.status = form.status;

      let r;
      if (form.id) {
        r = await apiJson(`/atividades/${atividadeId}/tarefas/${form.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        r = await apiJson(`/atividades/${atividadeId}/tarefas`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      onSaved?.(r.data);
      onClose();
    } catch (e) {
      setApiError(e.message);
      onError?.(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!open || !form) return null;

  const hasLinks = form.links.some((l) => l.titulo || l.url);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={form.id ? "Editar Tarefa" : "Nova Tarefa"}
      size="xl"
      footer={<EditModalFooter onCancel={onClose} onSave={save} saving={saving} showSaveContinue={false} />}
    >
      {apiError && <Alert type="error">{apiError}</Alert>}

      <div className="tarefa-form">
        <section className="tarefa-form__section">
          <h3 className="tarefa-form__title">Informações da tarefa</h3>
          <div className="tarefa-form__grid">
            <Input
              label="Nome da Tarefa"
              required
              className="span-2"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            />
            <Input
              label="Data de Início"
              type="date"
              value={form.data_inicio || ""}
              onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
            />
            {form.id ? (
              <Select
                label="Status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{STATUS_TAREFA_LABEL[s]}</option>
                ))}
              </Select>
            ) : (
              <Input label="Status" value="Aguardando" disabled />
            )}
          </div>
        </section>

        <section className="tarefa-form__section">
          <h3 className="tarefa-form__title">Commit / Descrição da Tarefa</h3>
          <Textarea
            rows={4}
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            placeholder="Descreva o que foi feito ou o que precisa ser feito..."
          />
        </section>

        <section className="tarefa-form__section">
          <h3 className="tarefa-form__title">Links da Tarefa</h3>
          <p className="text-muted" style={{ fontSize: "0.8rem", marginBottom: "0.5rem" }}>PR, Figma, Documentação, Ambiente de Testes, etc.</p>
          {form.links.map((l, i) => (
            <div key={i} className="link-row">
              <Input
                placeholder="Título (ex.: PR, Figma)"
                value={l.titulo}
                onChange={(e) => {
                  const links = [...form.links];
                  links[i] = { ...links[i], titulo: e.target.value };
                  setForm({ ...form, links });
                }}
              />
              <Input
                placeholder="URL"
                value={l.url}
                onChange={(e) => {
                  const links = [...form.links];
                  links[i] = { ...links[i], url: e.target.value };
                  setForm({ ...form, links });
                }}
              />
            </div>
          ))}
          {!hasLinks && form.id && <p className="text-muted">Nenhum link cadastrado.</p>}
          <Button size="sm" variant="ghost" onClick={() => setForm({ ...form, links: [...form.links, { titulo: "", url: "" }] })}>
            + Link
          </Button>
        </section>

        <section className="tarefa-form__section">
          <h3 className="tarefa-form__title">Anexos da Tarefa</h3>
          {!form.id ? (
            <p className="text-muted">Salve a tarefa para habilitar o envio de anexos.</p>
          ) : (
            <p className="text-muted">Upload de anexos será habilitado em breve (prints, PDFs, etc).</p>
          )}
        </section>

        <section className="tarefa-form__section">
          <h3 className="tarefa-form__title">Prompt da IA (Opcional)</h3>
          <Textarea
            rows={3}
            value={form.prompt_ia}
            onChange={(e) => setForm({ ...form, prompt_ia: e.target.value })}
            placeholder="Cole aqui o prompt utilizado para gerar ou auxiliar a implementação..."
          />
        </section>

        <section className="tarefa-form__section">
          <h3 className="tarefa-form__title">Comando da Branch</h3>
          <Input
            value={form.comando_branch}
            onChange={(e) => setForm({ ...form, comando_branch: e.target.value })}
            placeholder="git checkout -b feature/nome-da-tarefa"
          />
        </section>
      </div>
    </Modal>
  );
}
