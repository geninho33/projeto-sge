import { useEffect, useMemo, useRef, useState } from "react";
import { apiJson } from "../../api/client";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input, Select, Textarea } from "../ui/Input";
import { SearchableSelect } from "../ui/SearchableSelect";
import { Alert } from "../ui/Alert";

function mapPrioridade(p) {
  if (!p) return "media";
  const map = { P1: "alta", P2: "media", P3: "baixa", alta: "alta", media: "media", baixa: "baixa" };
  return map[p] || map[String(p).toUpperCase()] || "media";
}

const EMPTY = {
  backlog_item_id: "",
  executor_id: "",
  descricao: "",
  data_prevista_termino: "",
  prioridade: "media",
  observacoes: "",
  projeto_id: "",
  titulo: "",
};

export function GerarDemandaBacklogModal({ open, onClose, usuarios = [], onSuccess, onError }) {
  const [form, setForm] = useState(EMPTY);
  const [backlogs, setBacklogs] = useState([]);
  const [loadingBacklogs, setLoadingBacklogs] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState(null);
  const searchTimer = useRef(null);

  const loadBacklogs = async (term = "") => {
    setLoadingBacklogs(true);
    try {
      const params = new URLSearchParams({ limit: "80" });
      if (term.trim()) params.set("q", term.trim());
      const r = await apiJson(`/demandas/backlog-disponiveis?${params}`);
      setBacklogs(r.data || []);
    } catch (e) {
      setLocalError(e.message);
    } finally {
      setLoadingBacklogs(false);
    }
  };

  useEffect(() => {
    if (!open) return undefined;
    setForm(EMPTY);
    setLocalError(null);
    loadBacklogs();
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [open]);

  const selectedBacklog = useMemo(
    () => backlogs.find((b) => String(b.id) === String(form.backlog_item_id)) || null,
    [backlogs, form.backlog_item_id]
  );

  const canSave = Boolean(
    form.backlog_item_id
    && form.executor_id
    && form.descricao?.trim()
    && form.data_prevista_termino
    && form.prioridade
  );

  const onSelectBacklog = (id, item) => {
    const b = item || backlogs.find((x) => String(x.id) === String(id));
    setForm((prev) => ({
      ...prev,
      backlog_item_id: id,
      titulo: b?.titulo || prev.titulo,
      descricao: b?.descricao || b?.titulo || prev.descricao,
      prioridade: mapPrioridade(b?.prioridade),
      data_prevista_termino: b?.prazo?.slice?.(0, 10) || prev.data_prevista_termino,
      projeto_id: b?.projeto_id || prev.projeto_id,
      observacoes: b?.observacoes || prev.observacoes,
    }));
  };

  const onSearchBacklog = (term) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => loadBacklogs(term), 300);
  };

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    setLocalError(null);
    try {
      const r = await apiJson("/demandas/from-backlog", {
        method: "POST",
        body: JSON.stringify({
          backlog_item_id: Number(form.backlog_item_id),
          executor_id: Number(form.executor_id),
          descricao: form.descricao.trim(),
          data_prevista_termino: form.data_prevista_termino,
          prioridade: form.prioridade,
          observacoes: form.observacoes || null,
          projeto_id: form.projeto_id ? Number(form.projeto_id) : undefined,
          titulo: form.titulo || selectedBacklog?.titulo,
        }),
      });
      onSuccess?.(r.data);
      onClose?.();
    } catch (e) {
      const msg = e.message || "Falha ao gerar demanda";
      setLocalError(msg);
      onError?.(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Gerar Demanda pelo Backlog"
      size="lg"
      footer={(
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={save} loading={saving} disabled={!canSave || saving}>
            Gerar Demanda
          </Button>
        </>
      )}
    >
      {localError && <Alert type="error" onClose={() => setLocalError(null)}>{localError}</Alert>}

      <p className="text-muted" style={{ marginTop: 0 }}>
        Converte um item do backlog em demanda operacional, criando automaticamente a atividade e a tarefa inicial para o executor.
      </p>

      <div className="demanda-form__grid gerar-backlog-form">
        <SearchableSelect
          className="span-2"
          label="Backlog *"
          required
          placeholder={loadingBacklogs ? "Carregando..." : "Buscar código ou título..."}
          options={backlogs}
          value={form.backlog_item_id || null}
          onChange={onSelectBacklog}
          onSearchChange={onSearchBacklog}
          getOptionValue={(o) => o.id}
          getOptionLabel={(o) => `${o.codigo} — ${o.titulo}`}
          getOptionSubLabel={(o) => [o.prioridade, o.projeto_nome, o.modulo].filter(Boolean).join(" · ")}
          emptyMessage="Nenhum backlog disponível (itens já convertidos não aparecem)"
        />

        {selectedBacklog && (
          <div className="span-2 gerar-backlog-preview">
            <strong>{selectedBacklog.codigo}</strong>
            <span>{selectedBacklog.projeto_nome || "Sem projeto"} · Prioridade backlog: {selectedBacklog.prioridade}</span>
          </div>
        )}

        <Select
          label="Executor *"
          required
          value={form.executor_id}
          onChange={(e) => setForm({ ...form, executor_id: e.target.value })}
        >
          <option value="">Selecione o desenvolvedor...</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>{u.nome}</option>
          ))}
        </Select>

        <Input
          label="Data de entrega *"
          type="date"
          required
          value={form.data_prevista_termino}
          onChange={(e) => setForm({ ...form, data_prevista_termino: e.target.value })}
        />

        <Select
          label="Prioridade *"
          required
          value={form.prioridade}
          onChange={(e) => setForm({ ...form, prioridade: e.target.value })}
        >
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </Select>

        <Input
          label="Título da demanda"
          value={form.titulo}
          onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          placeholder="Pré-preenchido com o título do backlog"
        />

        <Textarea
          label="Descrição da demanda *"
          className="span-2"
          rows={5}
          required
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
        />

        <Textarea
          label="Observações"
          className="span-2"
          rows={3}
          value={form.observacoes}
          onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
        />
      </div>
    </Modal>
  );
}
