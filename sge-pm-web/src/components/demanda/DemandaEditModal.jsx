import { useEffect, useState } from "react";
import { apiJson } from "../../api/client";
import { Modal } from "../ui/Modal";
import { EditModalFooter } from "../ui/EditModalFooter";
import { Input, Select, Textarea } from "../ui/Input";
import { Alert } from "../ui/Alert";
import { FASES_LABEL } from "../../constants/cores";

const TABS = [
  { id: "geral", label: "Geral" },
  { id: "detalhes", label: "Detalhes" },
  { id: "links", label: "Links" },
];

const FASES_EDIT = ["criacao", "analise", "desenvolvimento", "homologacao", "aprovacao"];

export function DemandaEditModal({ open, demandaId, projetos, usuarios, onClose, onSaved, onError }) {
  const [form, setForm] = useState(null);
  const [links, setLinks] = useState([]);
  const [tab, setTab] = useState("geral");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !demandaId) return;
    setTab("geral");
    setError(null);
    setLoading(true);
    apiJson(`/demandas/${demandaId}/completo`)
      .then((r) => {
        const d = r.data;
        setForm({
          titulo: d.titulo || "",
          projeto_id: d.projeto_id,
          fase: d.fase || "criacao",
          solicitante_id: d.solicitante_id,
          responsavel_id: d.responsavel_id,
          data_prevista_termino: d.data_prevista_termino || d.prazo || "",
          prioridade: d.prioridade || "media",
          descricao_detalhada: d.descricao_detalhada || d.descricao || "",
          observacoes_demanda: d.observacoes_demanda || d.observacoes || "",
        });
        setLinks(d.links?.length ? d.links.map((l) => ({ titulo: l.titulo, url: l.url })) : [{ titulo: "", url: "" }]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [open, demandaId]);

  const save = async () => {
    if (!form?.titulo?.trim()) {
      setError("Título é obrigatório.");
      setTab("geral");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const r = await apiJson(`/demandas/${demandaId}/flow`, {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          links: links.filter((l) => l.titulo && l.url),
        }),
      });
      onSaved?.(r.data);
      onClose();
    } catch (e) {
      setError(e.message);
      onError?.(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={form ? `Editar — ${form.titulo || "Demanda"}` : "Editar Demanda"}
      size="full"
      footer={<EditModalFooter onCancel={onClose} onSave={save} saving={saving} showSaveContinue={false} />}
    >
      {error && <Alert type="error">{error}</Alert>}
      {loading && <p className="text-muted">Carregando...</p>}

      {form && !loading && (
        <>
          <nav className="tab-bar tab-bar--modal">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`tab-bar__item${tab === t.id ? " active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {tab === "geral" && (
            <div className="demanda-form__grid">
              <Input
                label="Título"
                required
                className="span-2"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              />
              <Select
                label="Projeto"
                required
                value={form.projeto_id || ""}
                onChange={(e) => setForm({ ...form, projeto_id: Number(e.target.value) })}
              >
                {projetos.map((p) => <option key={p.id} value={p.id}>{p.codigo} — {p.nome}</option>)}
              </Select>
              <Select label="Fase" value={form.fase} onChange={(e) => setForm({ ...form, fase: e.target.value })}>
                {FASES_EDIT.map((f) => <option key={f} value={f}>{FASES_LABEL[f]}</option>)}
              </Select>
              <Select
                label="Solicitante"
                value={form.solicitante_id || ""}
                onChange={(e) => setForm({ ...form, solicitante_id: Number(e.target.value) })}
              >
                {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </Select>
              <Select
                label="Responsável"
                value={form.responsavel_id || ""}
                onChange={(e) => setForm({ ...form, responsavel_id: Number(e.target.value) })}
              >
                {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </Select>
              <Input
                label="Prazo previsto"
                type="date"
                value={form.data_prevista_termino?.slice(0, 10) || ""}
                onChange={(e) => setForm({ ...form, data_prevista_termino: e.target.value })}
              />
              <Select label="Prioridade" value={form.prioridade} onChange={(e) => setForm({ ...form, prioridade: e.target.value })}>
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </Select>
            </div>
          )}

          {tab === "detalhes" && (
            <div className="demanda-form__grid">
              <Textarea
                label="Descrição detalhada"
                className="span-2"
                rows={8}
                value={form.descricao_detalhada}
                onChange={(e) => setForm({ ...form, descricao_detalhada: e.target.value })}
              />
              <Textarea
                label="Observações"
                className="span-2"
                rows={4}
                value={form.observacoes_demanda}
                onChange={(e) => setForm({ ...form, observacoes_demanda: e.target.value })}
              />
            </div>
          )}

          {tab === "links" && (
            <div>
              <span className="ui-field__label">Links relacionados</span>
              {links.map((l, i) => (
                <div key={i} className="link-row">
                  <Input
                    placeholder="Título"
                    value={l.titulo}
                    onChange={(e) => {
                      const n = [...links];
                      n[i] = { ...n[i], titulo: e.target.value };
                      setLinks(n);
                    }}
                  />
                  <Input
                    placeholder="URL"
                    value={l.url}
                    onChange={(e) => {
                      const n = [...links];
                      n[i] = { ...n[i], url: e.target.value };
                      setLinks(n);
                    }}
                  />
                </div>
              ))}
              <button type="button" className="ui-btn ui-btn--sm ui-btn--ghost" onClick={() => setLinks([...links, { titulo: "", url: "" }])}>
                + Link
              </button>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
