import { useCallback, useEffect, useState } from "react";
import { apiJson } from "../api/client";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { DataGrid } from "../components/ui/DataGrid";
import { Button } from "../components/ui/Button";
import { Input, Select, Textarea } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { EditModalFooter } from "../components/ui/EditModalFooter";
import { StatusBadge } from "../components/ui/Badge";
import { Alert } from "../components/ui/Alert";
import { STATUS_PROJETO } from "../constants/cores";

const CORES = ["#1E6FD9", "#059669", "#DC2626", "#D97706", "#7C3AED", "#00D2FF", "#64748B"];

export default function ProjetosPage() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [usuarios, setUsuarios] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sort, setSort] = useState("codigo");
  const [order, setOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const debouncedQ = useDebouncedValue(q);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit), sort, order });
      if (debouncedQ) params.set("q", debouncedQ);
      const r = await apiJson(`/projetos?${params}`);
      setRows(r.data);
      setMeta(r.meta);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [page, limit, sort, order, debouncedQ]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { apiJson("/usuarios").then((r) => setUsuarios(r.data)).catch(() => {}); }, []);
  useEffect(() => { setPage(1); }, [debouncedQ, limit]);

  const handleSort = (f) => {
    if (sort === f) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSort(f); setOrder("asc"); }
    setPage(1);
  };

  const save = async (keepOpen = false) => {
    setSaving(true);
    try {
      const body = { ...edit, responsavel_id: edit.responsavel_id || null };
      if (edit.id) await apiJson(`/projetos/${edit.id}`, { method: "PUT", body: JSON.stringify(body) });
      else await apiJson("/projetos", { method: "POST", body: JSON.stringify(body) });
      setSuccess("Projeto salvo com sucesso.");
      await load();
      if (!keepOpen) setEdit(null);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const columns = [
    { key: "actions", label: "Operações", sortable: false },
    { key: "codigo", label: "Código", sortable: true },
    { key: "nome", label: "Nome", sortable: true },
    { key: "cliente", label: "Cliente", sortable: true },
    { key: "responsavel_nome", label: "Responsável", sortable: true },
    { key: "status", label: "Status", sortable: true },
  ];

  return (
    <>
      {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess(null)}>{success}</Alert>}
      <DataGrid
        title="Projetos"
        subtitle="Gerenciamento de projetos e entregas"
        searchValue={q}
        onSearchChange={setQ}
        searchPlaceholder="Buscar código, nome, cliente, responsável..."
        columns={columns}
        rows={rows}
        sort={sort}
        order={order}
        onSort={handleSort}
        page={meta.page || page}
        limit={meta.limit || limit}
        total={meta.total || 0}
        totalPages={meta.totalPages || 1}
        onPageChange={setPage}
        onLimitChange={(n) => { setLimit(n); setPage(1); }}
        loading={loading}
        actions={<Button onClick={() => setEdit({ nome: "", status: "planejamento", cor: "#1E6FD9", ativo: 1 })}>Novo Projeto</Button>}
        renderRow={(p) => (
          <tr key={p.id}>
            <td className="table-actions"><Button size="sm" variant="ghost" onClick={() => setEdit({ ...p })}>Editar</Button></td>
            <td><span className="proj-dot" style={{ background: p.cor }} /> <strong>{p.codigo}</strong></td>
            <td>{p.nome}</td>
            <td>{p.cliente || "—"}</td>
            <td>{p.responsavel_nome || "—"}</td>
            <td><StatusBadge value={p.status} label={STATUS_PROJETO[p.status]} /></td>
          </tr>
        )}
      />
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? `Editar ${edit.codigo}` : "Novo Projeto"} size="xl"
        footer={<EditModalFooter onCancel={() => setEdit(null)} onSave={() => save(false)} onSaveContinue={() => save(true)} saving={saving} />}>
        {edit && (
          <div className="form-grid">
            <Input label="Nome *" className="span-2" value={edit.nome || ""} onChange={(e) => setEdit({ ...edit, nome: e.target.value })} />
            <Input label="Cliente/Órgão" value={edit.cliente || ""} onChange={(e) => setEdit({ ...edit, cliente: e.target.value })} />
            <Select label="Status" value={edit.status || "planejamento"} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>
              {Object.entries(STATUS_PROJETO).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
            <Select label="Responsável" value={edit.responsavel_id || ""} onChange={(e) => setEdit({ ...edit, responsavel_id: e.target.value })}>
              <option value="">—</option>
              {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </Select>
            <Input label="Início" type="date" value={edit.data_inicio?.slice(0, 10) || ""} onChange={(e) => setEdit({ ...edit, data_inicio: e.target.value })} />
            <Input label="Término previsto" type="date" value={edit.data_fim_prevista?.slice(0, 10) || ""} onChange={(e) => setEdit({ ...edit, data_fim_prevista: e.target.value })} />
            <div className="span-2">
              <span className="ui-field__label">Cor de identificação</span>
              <div className="color-picker">{CORES.map((c) => (
                <button key={c} type="button" className={`color-swatch${edit.cor === c ? " active" : ""}`} style={{ background: c }} onClick={() => setEdit({ ...edit, cor: c })} />
              ))}</div>
            </div>
            <Textarea label="Descrição" className="span-2" value={edit.descricao || ""} onChange={(e) => setEdit({ ...edit, descricao: e.target.value })} />
            <label className="ui-checkbox"><input type="checkbox" checked={!!edit.ativo} onChange={(e) => setEdit({ ...edit, ativo: e.target.checked ? 1 : 0 })} /> Ativo</label>
          </div>
        )}
      </Modal>
    </>
  );
}
