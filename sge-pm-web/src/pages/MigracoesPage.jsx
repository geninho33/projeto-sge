import { useCallback, useEffect, useState } from "react";
import { apiJson } from "../api/client";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select, Textarea } from "../components/ui/Input";
import { Modal, ModalActions } from "../components/ui/Modal";
import { StatusBadge } from "../components/ui/Badge";
import { Alert } from "../components/ui/Alert";
import { PageLoader } from "../components/ui/Spinner";

const STATUS = [
  ["planejada", "Planejada"],
  ["em_implantacao", "Em implantação"],
  ["implantada", "Implantada"],
  ["rollback", "Rollback"],
];

const emptyForm = () => ({
  projeto_id: 1, sprint_id: "", branch_nome: "", desenvolvedor_id: "",
  funcionalidades: "", correcoes: "", scripts_db: "", alteracoes_config: "",
  observacoes: "", status_implantacao: "planejada", backlog_item_ids: [],
});

export default function MigracoesPage() {
  const [rows, setRows] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [backlog, setBacklog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [m, u, s, b] = await Promise.all([
        apiJson("/migracoes"),
        apiJson("/usuarios"),
        apiJson("/sprint"),
        apiJson("/backlog?limit=200"),
      ]);
      setRows(m.data);
      setUsuarios(u.data);
      setSprints(s.data);
      setBacklog(b.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(emptyForm()); setModal("create"); };
  const openEdit = async (id) => {
    const { data } = await apiJson(`/migracoes/${id}`);
    setForm({
      ...data,
      sprint_id: data.sprint_id || "",
      desenvolvedor_id: data.desenvolvedor_id || "",
      backlog_item_ids: (data.backlog_itens || []).map((b) => b.id),
    });
    setModal("edit");
  };

  const toggleBacklog = (id) => {
    const ids = new Set(form.backlog_item_ids || []);
    if (ids.has(id)) ids.delete(id); else ids.add(id);
    setForm({ ...form, backlog_item_ids: [...ids] });
  };

  const save = async () => {
    setSaving(true);
    try {
      const body = {
        ...form,
        sprint_id: form.sprint_id || null,
        desenvolvedor_id: form.desenvolvedor_id || null,
      };
      if (modal === "create") {
        await apiJson("/migracoes", { method: "POST", body: JSON.stringify(body) });
      } else {
        await apiJson(`/migracoes/${form.id}`, { method: "PUT", body: JSON.stringify(body) });
      }
      setModal(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !rows.length) return <PageLoader />;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Migrações e Implantações</h1>
          <p className="page-subtitle">Controle de deploys, scripts e itens vinculados</p>
        </div>
        <Button onClick={openCreate}>Nova Migração</Button>
      </header>

      {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}

      <div className="grid-cards">
        {rows.map((m) => (
          <Card key={m.id} hover>
            <div className="migracao-card__head">
              <strong>#{m.id} — {m.branch_nome || "Sem branch"}</strong>
              <StatusBadge value={m.status_implantacao} />
            </div>
            <p className="migracao-card__meta">
              {m.desenvolvedor_nome && <>Dev: {m.desenvolvedor_nome} · </>}
              Sprint: {m.sprint_nome || "—"}
            </p>
            <p className="migracao-card__items">
              {(m.backlog_itens || []).length} itens de backlog vinculados
            </p>
            <Button size="sm" variant="ghost" onClick={() => openEdit(m.id)}>Editar</Button>
          </Card>
        ))}
      </div>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === "create" ? "Nova Migração" : "Editar Migração"}
        size="lg"
        footer={<ModalActions onCancel={() => setModal(null)} onConfirm={save} loading={saving} />}
      >
        <div className="form-grid">
          <Input label="Branch" value={form.branch_nome || ""} onChange={(e) => setForm({ ...form, branch_nome: e.target.value })} />
          <Select label="Status" value={form.status_implantacao || "planejada"} onChange={(e) => setForm({ ...form, status_implantacao: e.target.value })}>
            {STATUS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
          <Select label="Sprint" value={form.sprint_id || ""} onChange={(e) => setForm({ ...form, sprint_id: e.target.value })}>
            <option value="">—</option>
            {sprints.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </Select>
          <Select label="Desenvolvedor" value={form.desenvolvedor_id || ""} onChange={(e) => setForm({ ...form, desenvolvedor_id: e.target.value })}>
            <option value="">—</option>
            {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </Select>
          <Textarea label="Funcionalidades" className="span-2" value={form.funcionalidades || ""} onChange={(e) => setForm({ ...form, funcionalidades: e.target.value })} />
          <Textarea label="Correções" className="span-2" value={form.correcoes || ""} onChange={(e) => setForm({ ...form, correcoes: e.target.value })} />
          <Textarea label="Scripts DB" className="span-2" value={form.scripts_db || ""} onChange={(e) => setForm({ ...form, scripts_db: e.target.value })} />
          <Textarea label="Alterações de config" className="span-2" value={form.alteracoes_config || ""} onChange={(e) => setForm({ ...form, alteracoes_config: e.target.value })} />
          <Textarea label="Observações" className="span-2" value={form.observacoes || ""} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
        </div>
        <div className="backlog-picker">
          <h4>Itens do Backlog vinculados</h4>
          <div className="backlog-picker__list">
            {backlog.slice(0, 50).map((b) => (
              <label key={b.id} className="ui-checkbox">
                <input
                  type="checkbox"
                  checked={(form.backlog_item_ids || []).includes(b.id)}
                  onChange={() => toggleBacklog(b.id)}
                />
                {b.codigo} — {b.titulo?.slice(0, 60)}
              </label>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
