import { useCallback, useEffect, useState } from "react";
import { apiJson } from "../api/client";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { DataGrid } from "../components/ui/DataGrid";
import { Button } from "../components/ui/Button";
import { Input, Select, Textarea } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { EditModalFooter } from "../components/ui/EditModalFooter";
import { PriorityBadge, StatusBadge } from "../components/ui/Badge";
import { BacklogVisaoModal } from "../components/backlog/BacklogVisaoModal";

const KANBAN_OPTS = [
  "backlog", "a_fazer", "em_desenvolvimento", "em_revisao", "em_testes", "homologacao", "concluido",
];

export default function BacklogList() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [usuarios, setUsuarios] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [q, setQ] = useState("");
  const [prioridade, setPrioridade] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sort, setSort] = useState("codigo");
  const [order, setOrder] = useState("asc");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(null);
  const [visaoCodigo, setVisaoCodigo] = useState(null);
  const [saving, setSaving] = useState(false);

  const debouncedQ = useDebouncedValue(q);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit), sort, order });
      if (debouncedQ) params.set("q", debouncedQ);
      if (prioridade) params.set("prioridade", prioridade);
      const r = await apiJson(`/backlog?${params}`);
      setItems(r.data);
      setMeta(r.meta);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sort, order, debouncedQ, prioridade]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    Promise.all([apiJson("/usuarios"), apiJson("/sprint")])
      .then(([u, s]) => { setUsuarios(u.data); setSprints(s.data); })
      .catch(() => {});
  }, []);

  useEffect(() => { setPage(1); }, [debouncedQ, prioridade, limit]);

  const handleSort = (field) => {
    if (sort === field) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSort(field); setOrder("asc"); }
    setPage(1);
  };

  const save = async (keepOpen = false) => {
    setSaving(true);
    try {
      const body = {
        ...edit,
        responsavel_id: edit.responsavel_id || null,
        sprint_id: edit.sprint_id || null,
        projeto_id: edit.projeto_id || 1,
      };
      await apiJson(`/backlog/${edit.codigo}`, { method: "PUT", body: JSON.stringify(body) });
      setSuccess(`Item ${edit.codigo} salvo com sucesso.`);
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
    { key: "projeto_nome", label: "Projeto", sortable: true },
    { key: "prioridade", label: "Prioridade", sortable: true },
    { key: "responsavel_nome", label: "Responsável", sortable: true },
    { key: "score", label: "Score", sortable: true },
    { key: "story_points", label: "Pts", sortable: true },
    { key: "kanban_status", label: "Status", sortable: true },
  ];

  return (
    <>
      {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess(null)}>{success}</Alert>}

      <DataGrid
        title="Product Backlog"
        subtitle={`${meta.total || 0} itens cadastrados`}
        searchPlaceholder="Buscar por código, título, descrição, projeto, responsável, status, tags..."
        searchValue={q}
        onSearchChange={setQ}
        toolbar={(
          <div className="filter-chips">
            {["", "P1", "P2", "P3"].map((p) => (
              <Button
                key={p || "all"}
                size="sm"
                variant={prioridade === p ? "primary" : "ghost"}
                onClick={() => setPrioridade(p)}
              >
                {p || "Todas prioridades"}
              </Button>
            ))}
          </div>
        )}
        columns={columns}
        rows={items}
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
        renderRow={(i) => (
          <tr key={i.codigo}>
            <td className="table-actions">
              <div style={{ display: "flex", gap: "0.25rem" }}>
                <Button size="sm" variant="ghost" onClick={() => setVisaoCodigo(i.codigo)} title="Visão do backlog">
                  👁 Visão
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEdit({ ...i })} title="Editar item">
                  ✎ Editar
                </Button>
              </div>
            </td>
            <td><strong>{i.codigo}</strong></td>
            <td className="cell-truncate" title={i.titulo}>{i.titulo}</td>
            <td>{i.projeto_nome || "—"}</td>
            <td><PriorityBadge value={i.prioridade} /></td>
            <td>{i.responsavel_nome || "—"}</td>
            <td>{i.score}</td>
            <td>{i.story_points}</td>
            <td><StatusBadge value={i.kanban_status || "backlog"} /></td>
          </tr>
        )}
      />

      <BacklogVisaoModal
        open={!!visaoCodigo}
        codigo={visaoCodigo}
        onClose={() => setVisaoCodigo(null)}
      />

      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title={`Editar Backlog — ${edit?.codigo}`}
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
          <div className="form-grid">
            <Input label="Código" value={edit.codigo} disabled className="span-2" />
            <Input label="Título" className="span-2" value={edit.titulo || ""} onChange={(e) => setEdit({ ...edit, titulo: e.target.value })} />
            <Select label="Prioridade" value={edit.prioridade || "P2"} onChange={(e) => setEdit({ ...edit, prioridade: e.target.value })}>
              {["P1", "P2", "P3"].map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
            <Select label="Status geral" value={edit.status_geral || "backlog"} onChange={(e) => setEdit({ ...edit, status_geral: e.target.value })}>
              {["backlog", "em_andamento", "bloqueado", "concluido"].map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select label="Status Kanban" value={edit.kanban_status || "backlog"} onChange={(e) => setEdit({ ...edit, kanban_status: e.target.value })}>
              {KANBAN_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select label="Responsável" value={edit.responsavel_id || ""} onChange={(e) => setEdit({ ...edit, responsavel_id: e.target.value })}>
              <option value="">—</option>
              {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </Select>
            <Select label="Sprint" value={edit.sprint_id || ""} onChange={(e) => setEdit({ ...edit, sprint_id: e.target.value })}>
              <option value="">—</option>
              {sprints.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </Select>
            <Input label="Prazo" type="date" value={edit.prazo?.slice(0, 10) || ""} onChange={(e) => setEdit({ ...edit, prazo: e.target.value })} />
            <Input label="Story Points" type="number" value={edit.story_points ?? ""} onChange={(e) => setEdit({ ...edit, story_points: Number(e.target.value) })} />
            <Input label="Estimativa (h)" type="number" value={edit.estimativa || ""} onChange={(e) => setEdit({ ...edit, estimativa: e.target.value })} />
            <Input label="Tags" placeholder="ex: api, grid, migração" className="span-2" value={edit.tags || ""} onChange={(e) => setEdit({ ...edit, tags: e.target.value })} />
            <Textarea label="Descrição" className="span-2" value={edit.descricao || ""} onChange={(e) => setEdit({ ...edit, descricao: e.target.value })} />
            <Textarea label="Critérios de aceite" className="span-2" value={edit.criterios_aceite || ""} onChange={(e) => setEdit({ ...edit, criterios_aceite: e.target.value })} />
            <Textarea label="Observações" className="span-2" value={edit.observacoes || ""} onChange={(e) => setEdit({ ...edit, observacoes: e.target.value })} />
          </div>
        )}
      </Modal>
    </>
  );
}
