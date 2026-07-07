import { useCallback, useEffect, useState } from "react";
import { apiJson } from "../api/client";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { DataGrid } from "../components/ui/DataGrid";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { EditModalFooter } from "../components/ui/EditModalFooter";
import { PriorityBadge } from "../components/ui/Badge";
import { Alert } from "../components/ui/Alert";

const STATUSES = [
  ["nao_iniciado", "Não iniciado"],
  ["em_dev", "Em desenvolvimento"],
  ["em_review", "Em revisão"],
  ["pronto", "Pronto"],
  ["merged", "Merged"],
];

function StatusCell({ status }) {
  if (!status) return "—";
  return (
    <span className="status-cell" title={status}>
      <span className={`status-dot status-${status}`} />
      {STATUSES.find(([v]) => v === status)?.[1] || status}
    </span>
  );
}

function userHasPerfil(u, codigo) {
  const perfis = Array.isArray(u.perfis) && u.perfis.length ? u.perfis : (u.perfil ? [u.perfil] : []);
  return perfis.includes(codigo);
}

export default function MapeamentoPage() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [usuarios, setUsuarios] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sort, setSort] = useState("codigo");
  const [order, setOrder] = useState("asc");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const debouncedQ = useDebouncedValue(q);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit), sort, order });
      if (debouncedQ) params.set("q", debouncedQ);
      const r = await apiJson(`/mapeamento?${params}`);
      setRows(r.data);
      setMeta(r.meta);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sort, order, debouncedQ]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    apiJson("/usuarios").then((r) => setUsuarios(r.data)).catch(() => {});
  }, []);
  useEffect(() => { setPage(1); }, [debouncedQ, limit]);

  const handleSort = (field) => {
    if (sort === field) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSort(field); setOrder("asc"); }
    setPage(1);
  };

  const openEdit = (row) => {
    setEdit(row);
    setForm({
      id_user_front: row.id_user_front || "",
      id_user_back: row.id_user_back || "",
      status_front: row.status_front || "nao_iniciado",
      status_back: row.status_back || "nao_iniciado",
      branch_front: row.branch_front || "",
      branch_back: row.branch_back || "",
      api_contract_path: row.api_contract_path || "",
      pr_front_url: row.pr_front_url || "",
      pr_back_url: row.pr_back_url || "",
    });
  };

  const save = async (keepOpen = false) => {
    setSaving(true);
    try {
      const body = {
        ...form,
        id_user_front: form.id_user_front ? Number(form.id_user_front) : null,
        id_user_back: form.id_user_back ? Number(form.id_user_back) : null,
      };
      await apiJson(`/mapeamento/${edit.codigo}`, { method: "PATCH", body: JSON.stringify(body) });
      setSuccess(`Mapeamento ${edit.codigo} salvo com sucesso.`);
      await load();
      if (!keepOpen) setEdit(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "actions", label: "Operações", sortable: false },
    { key: "codigo", label: "Código", sortable: true },
    { key: "titulo", label: "Título", sortable: true },
    { key: "prioridade", label: "Prioridade", sortable: true },
    { key: "branch_front", label: "Branch Front", sortable: true },
    { key: "branch_back", label: "Branch Back", sortable: true },
    { key: "dev_front_nome", label: "Dev Front", sortable: true },
    { key: "dev_back_nome", label: "Dev Back", sortable: true },
    { key: "status_front", label: "Status F", sortable: true },
    { key: "status_back", label: "Status B", sortable: true },
  ];

  return (
    <>
      {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess(null)}>{success}</Alert>}

      <DataGrid
        title="Mapeamento de Mudança"
        subtitle="Planejamento de branches, responsáveis e status de implantação"
        searchPlaceholder="Buscar por código, título, branch, responsável, status, projeto, tags..."
        searchValue={q}
        onSearchChange={setQ}
        columns={columns}
        rows={rows}
        rowKey="codigo"
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
        renderRow={(r) => (
          <tr key={r.codigo}>
            <td className="table-actions">
              <Button size="sm" variant="ghost" onClick={() => openEdit(r)} title="Editar mapeamento">
                ✎ Editar
              </Button>
            </td>
            <td><strong>{r.codigo}</strong></td>
            <td className="cell-truncate" title={r.titulo}>{r.titulo}</td>
            <td><PriorityBadge value={r.prioridade} /></td>
            <td><code className="code-cell">{r.branch_front || "—"}</code></td>
            <td><code className="code-cell">{r.branch_back || "—"}</code></td>
            <td>{r.dev_front_nome || "—"}</td>
            <td>{r.dev_back_nome || "—"}</td>
            <td><StatusCell status={r.status_front} /></td>
            <td><StatusCell status={r.status_back} /></td>
          </tr>
        )}
      />

      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title={`Editar Mapeamento — ${edit?.codigo}`}
        size="xl"
        footer={(
          <EditModalFooter
            onCancel={() => setEdit(null)}
            onSave={() => save(false)}
            onSaveContinue={() => save(true)}
            saving={saving}
          />
        )}
      >
        {edit && (
          <>
            <div className="modal-info-bar">
              <span><strong>{edit.titulo}</strong></span>
              <PriorityBadge value={edit.prioridade} />
              {edit.projeto_nome && <span>{edit.projeto_nome}</span>}
            </div>
            <div className="form-grid">
              <Select label="Dev Frontend" value={form.id_user_front || ""} onChange={(e) => setForm({ ...form, id_user_front: e.target.value })}>
                <option value="">—</option>
                {usuarios.filter((u) => userHasPerfil(u, "desenvolvedor")).map((u) => (
                  <option key={u.id} value={u.id}>{u.nome}</option>
                ))}
              </Select>
              <Select label="Dev Backend" value={form.id_user_back || ""} onChange={(e) => setForm({ ...form, id_user_back: e.target.value })}>
                <option value="">—</option>
                {usuarios.filter((u) => userHasPerfil(u, "desenvolvedor")).map((u) => (
                  <option key={u.id} value={u.id}>{u.nome}</option>
                ))}
              </Select>
              <Select label="Status Frontend" value={form.status_front} onChange={(e) => setForm({ ...form, status_front: e.target.value })}>
                {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
              <Select label="Status Backend" value={form.status_back} onChange={(e) => setForm({ ...form, status_back: e.target.value })}>
                {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
              <Input label="Branch Frontend" className="span-2" value={form.branch_front} onChange={(e) => setForm({ ...form, branch_front: e.target.value })} />
              <Input label="Branch Backend" className="span-2" value={form.branch_back} onChange={(e) => setForm({ ...form, branch_back: e.target.value })} />
              <Input label="Contrato API" className="span-2" value={form.api_contract_path} onChange={(e) => setForm({ ...form, api_contract_path: e.target.value })} />
              <Input label="PR Frontend (URL)" value={form.pr_front_url || ""} onChange={(e) => setForm({ ...form, pr_front_url: e.target.value })} />
              <Input label="PR Backend (URL)" value={form.pr_back_url || ""} onChange={(e) => setForm({ ...form, pr_back_url: e.target.value })} />
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
