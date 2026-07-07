import { useCallback, useEffect, useState } from "react";
import { apiJson } from "../api/client";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select, Textarea } from "../components/ui/Input";
import { Modal, ModalActions } from "../components/ui/Modal";
import { PriorityBadge, StatusBadge } from "../components/ui/Badge";
import { Alert } from "../components/ui/Alert";
import { PageLoader } from "../components/ui/Spinner";

const BRANCH_TIPOS = ["feature", "bugfix", "hotfix", "release"];
const AMBIENTES = ["desenvolvimento", "homologacao", "producao"];
const SITUACOES = [
  "backlog", "a_fazer", "em_desenvolvimento", "em_revisao", "em_testes", "homologacao", "concluido",
];

const emptyForm = () => ({
  titulo: "", backlog_item_id: "", projeto_id: 1, sprint_id: "", responsavel_id: "",
  revisor_id: "", homologador_id: "", branch_nome: "", branch_tipo: "feature", branch_status: "aberta",
  repositorio: "projeto-sge", prazo: "", data_inicio: "", data_prevista_conclusao: "",
  prioridade: "media", situacao: "a_fazer", percentual_execucao: 0, ambiente: "desenvolvimento", observacoes: "",
});

export default function DemandasPage() {
  const [rows, setRows] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = q ? `?q=${encodeURIComponent(q)}` : "";
      const [d, u, s] = await Promise.all([
        apiJson(`/demandas${params}`),
        apiJson("/usuarios"),
        apiJson("/sprint"),
      ]);
      setRows(d.data);
      setUsuarios(u.data);
      setSprints(s.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(emptyForm()); setModal("create"); };
  const openEdit = (row) => {
    setForm({
      ...row,
      sprint_id: row.sprint_id || "",
      responsavel_id: row.responsavel_id || "",
      revisor_id: row.revisor_id || "",
      homologador_id: row.homologador_id || "",
      prazo: row.prazo?.slice(0, 10) || "",
      data_inicio: row.data_inicio?.slice(0, 10) || "",
      data_prevista_conclusao: row.data_prevista_conclusao?.slice(0, 10) || "",
    });
    setModal("edit");
  };

  const save = async () => {
    if (!form.titulo?.trim()) return setError("Título obrigatório");
    setSaving(true);
    try {
      const body = {
        ...form,
        sprint_id: form.sprint_id || null,
        responsavel_id: form.responsavel_id || null,
        revisor_id: form.revisor_id || null,
        homologador_id: form.homologador_id || null,
        backlog_item_id: form.backlog_item_id || null,
      };
      if (modal === "create") {
        await apiJson("/demandas", { method: "POST", body: JSON.stringify(body) });
      } else {
        await apiJson(`/demandas/${form.id}`, { method: "PUT", body: JSON.stringify(body) });
      }
      setModal(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Excluir esta demanda?")) return;
    await apiJson(`/demandas/${id}`, { method: "DELETE" });
    load();
  };

  if (loading && !rows.length) return <PageLoader />;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Atribuição de Demandas</h1>
          <p className="page-subtitle">Distribuição de atividades, branches e responsáveis</p>
        </div>
        <Button onClick={openCreate}>Nova Demanda</Button>
      </header>

      {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}

      <Card className="toolbar-card">
        <Input
          placeholder="Buscar por título, branch ou código..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </Card>

      <Card>
        <div className="table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Operações</th>
                <th>Título</th>
                <th>Responsável</th>
                <th>Branch</th>
                <th>Sprint</th>
                <th>Prioridade</th>
                <th>Situação</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="table-actions">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>Editar</Button>
                    <Button size="sm" variant="danger" onClick={() => remove(r.id)}>Excluir</Button>
                  </td>
                  <td><strong>{r.titulo}</strong>{r.backlog_codigo && <small> · {r.backlog_codigo}</small>}</td>
                  <td>{r.responsavel_nome || "—"}</td>
                  <td><code>{r.branch_nome || "—"}</code> <small>({r.branch_tipo})</small></td>
                  <td>{r.sprint_nome || "—"}</td>
                  <td><PriorityBadge value={r.prioridade} /></td>
                  <td><StatusBadge value={r.situacao} /></td>
                  <td>{r.percentual_execucao ?? 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === "create" ? "Nova Demanda" : "Editar Demanda"}
        size="lg"
        footer={<ModalActions onCancel={() => setModal(null)} onConfirm={save} loading={saving} />}
      >
        <div className="form-grid">
          <Input label="Título" className="span-2" value={form.titulo || ""} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
          <Select label="Responsável" value={form.responsavel_id || ""} onChange={(e) => setForm({ ...form, responsavel_id: e.target.value })}>
            <option value="">—</option>
            {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </Select>
          <Select label="Sprint" value={form.sprint_id || ""} onChange={(e) => setForm({ ...form, sprint_id: e.target.value })}>
            <option value="">—</option>
            {sprints.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </Select>
          <Input label="Branch" value={form.branch_nome || ""} onChange={(e) => setForm({ ...form, branch_nome: e.target.value })} />
          <Select label="Tipo branch" value={form.branch_tipo || "feature"} onChange={(e) => setForm({ ...form, branch_tipo: e.target.value })}>
            {BRANCH_TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Input label="Repositório" value={form.repositorio || ""} onChange={(e) => setForm({ ...form, repositorio: e.target.value })} />
          <Select label="Revisor" value={form.revisor_id || ""} onChange={(e) => setForm({ ...form, revisor_id: e.target.value })}>
            <option value="">—</option>
            {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </Select>
          <Select label="Homologador" value={form.homologador_id || ""} onChange={(e) => setForm({ ...form, homologador_id: e.target.value })}>
            <option value="">—</option>
            {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </Select>
          <Select label="Ambiente" value={form.ambiente || "desenvolvimento"} onChange={(e) => setForm({ ...form, ambiente: e.target.value })}>
            {AMBIENTES.map((a) => <option key={a} value={a}>{a}</option>)}
          </Select>
          <Select label="Situação" value={form.situacao || "a_fazer"} onChange={(e) => setForm({ ...form, situacao: e.target.value })}>
            {SITUACOES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Input label="Prazo" type="date" value={form.prazo || ""} onChange={(e) => setForm({ ...form, prazo: e.target.value })} />
          <Input label="% Execução" type="number" min={0} max={100} value={form.percentual_execucao ?? 0} onChange={(e) => setForm({ ...form, percentual_execucao: Number(e.target.value) })} />
          <Textarea label="Observações" className="span-2" value={form.observacoes || ""} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
