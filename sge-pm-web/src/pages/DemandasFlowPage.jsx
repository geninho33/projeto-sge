import { useCallback, useEffect, useState } from "react";
import { apiJson } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { DataGrid } from "../components/ui/DataGrid";
import { Button } from "../components/ui/Button";
import { Input, Select, Textarea } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { EditModalFooter } from "../components/ui/EditModalFooter";
import { Card } from "../components/ui/Card";
import { StatusBadge, PriorityBadge } from "../components/ui/Badge";
import { Avatar, AvatarGroup } from "../components/ui/Avatar";
import { Alert } from "../components/ui/Alert";
import { DemandaEditModal } from "../components/demanda/DemandaEditModal";
import { DemandaDetailModal } from "../components/demanda/DemandaDetailModal";
import { FASES_LABEL } from "../constants/cores";

const FASES_INICIAIS = ["criacao", "analise", "desenvolvimento"];
const KANBAN_FASES = ["criacao", "analise", "desenvolvimento", "homologacao", "aprovacao", "cancelada"];

export default function DemandasFlowPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [q, setQ] = useState("");
  const [fase, setFase] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editNew, setEditNew] = useState(null);
  const [editId, setEditId] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [links, setLinks] = useState([{ titulo: "", url: "" }]);
  const [viewMode, setViewMode] = useState("kanban");
  const debouncedQ = useDebouncedValue(q);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQ) params.set("q", debouncedQ);
      if (fase && viewMode === "lista") params.set("fase", fase);
      const r = await apiJson(`/demandas?${params}`);
      setRows(r.data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [debouncedQ, fase, viewMode]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    Promise.all([
      apiJson("/projetos?limit=200"),
      apiJson("/usuarios"),
    ]).then(([p, u]) => {
      setProjetos(p.data);
      setUsuarios(u.data);
    }).catch(() => {});
  }, []);

  const openNew = () => {
    setEditNew({
      titulo: "",
      projeto_id: projetos[0]?.id || "",
      fase: "criacao",
      descricao_detalhada: "",
      data_prevista_termino: "",
      solicitante_id: user?.id,
    });
    setLinks([{ titulo: "", url: "" }]);
  };

  const saveNew = async () => {
    setSaving(true);
    try {
      const body = {
        ...editNew,
        links: links.filter((l) => l.titulo && l.url),
      };
      await apiJson("/demandas", { method: "POST", body: JSON.stringify(body) });
      setSuccess("Demanda criada com sucesso.");
      setEditNew(null);
      await load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const columns = [
    { key: "actions", label: "Operações", sortable: false },
    { key: "codigo", label: "Código", sortable: false },
    { key: "titulo", label: "Título", sortable: false },
    { key: "projeto_nome", label: "Projeto", sortable: false },
    { key: "fase", label: "Fase", sortable: false },
    { key: "solicitante_nome", label: "Solicitante", sortable: false },
    { key: "data_prevista_termino", label: "Prazo", sortable: false },
  ];

  const kanbanColumns = {};
  for (const f of KANBAN_FASES) kanbanColumns[f] = [];
  for (const d of rows) {
    const f = d.fase || "criacao";
    if (kanbanColumns[f]) kanbanColumns[f].push(d);
    else kanbanColumns.criacao.push(d);
  }

  return (
    <>
      {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess(null)}>{success}</Alert>}

      <div className="page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h1 className="page-title">Demandas</h1>
          <p className="page-subtitle">Ciclo completo: projeto → demanda → atividades → tramitação</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <div className="view-toggle">
            <button type="button" className={`view-toggle__btn${viewMode === "lista" ? " active" : ""}`} onClick={() => setViewMode("lista")} title="Visualização em lista">☰</button>
            <button type="button" className={`view-toggle__btn${viewMode === "kanban" ? " active" : ""}`} onClick={() => setViewMode("kanban")} title="Visualização Kanban">▦</button>
          </div>
          <Button onClick={openNew}>Nova Demanda</Button>
        </div>
      </div>

      {viewMode === "lista" && (
        <DataGrid
          searchValue={q}
          onSearchChange={setQ}
          searchPlaceholder="Buscar código ou título..."
          columns={columns}
          rows={rows}
          page={1}
          limit={rows.length || 20}
          total={rows.length}
          totalPages={1}
          loading={loading}
          showPagination={false}
          toolbar={
            <Select value={fase} onChange={(e) => setFase(e.target.value)} style={{ minWidth: 160 }}>
              <option value="">Todas as fases</option>
              {Object.entries(FASES_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          }
          renderRow={(d) => (
            <tr key={d.id}>
              <td className="table-actions demanda-row__actions">
                <Button size="sm" variant="ghost" onClick={() => setEditId(d.id)}>Editar</Button>
                <Button size="sm" variant="ghost" onClick={() => setDetailId(d.id)}>Detalhes</Button>
              </td>
              <td><strong>{d.codigo}</strong></td>
              <td>{d.titulo}</td>
              <td>{d.projeto_nome || "—"}</td>
              <td><StatusBadge value={d.fase} label={FASES_LABEL[d.fase] || d.fase} /></td>
              <td>{d.solicitante_nome || "—"}</td>
              <td>{d.data_prevista_termino?.slice(0, 10) || d.prazo?.slice(0, 10) || "—"}</td>
            </tr>
          )}
        />
      )}

      {viewMode === "kanban" && (
        <>
          <div className="toolbar-row" style={{ marginBottom: "1rem" }}>
            <Input placeholder="Buscar código ou título..." value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 300 }} />
          </div>
          <div className="kanban-board kanban-board--flow">
            {KANBAN_FASES.map((colId) => (
              <div key={colId} className="kanban-column">
                <div className="kanban-column__header">
                  <h3>{FASES_LABEL[colId] || colId}</h3>
                  <span className="kanban-column__count">{(kanbanColumns[colId] || []).length}</span>
                </div>
                <div className="kanban-column__body">
                  {(kanbanColumns[colId] || []).map((d) => (
                    <div key={d.id} className="kcard" onClick={() => setDetailId(d.id)}>
                      <div className="kcard__header">
                        <div className="kcard__code-row">
                          <strong className="kcard__code">{d.codigo}</strong>
                          {d.projeto_nome && <span className="kcard__project">{d.projeto_nome}</span>}
                        </div>
                        <PriorityBadge value={d.prioridade} />
                      </div>
                      <h4 className="kcard__title">{d.titulo}</h4>
                      <div className="kcard__indicators">
                        <span className="kcard__indicator" title="Atividades">📋 {d.total_atividades || 0}</span>
                        <span className="kcard__indicator" title="Tarefas">☰ {d.total_tarefas || 0}</span>
                        <span className="kcard__indicator" title="Comentários">💬 {d.total_comentarios || 0}</span>
                      </div>
                      <div className="kcard__footer">
                        <AvatarGroup
                          users={[
                            ...(d.solicitante_nome ? [{ id: `sol-${d.id}`, nome: d.solicitante_nome, avatar_url: d.solicitante_avatar }] : []),
                            ...(d.executores || []),
                          ]}
                          max={4}
                          size={26}
                        />
                        <div className="kcard__btns">
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setDetailId(d.id); }}>Detalhes</Button>
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditId(d.id); }}>Editar</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <DemandaEditModal
        open={!!editId}
        demandaId={editId}
        projetos={projetos}
        usuarios={usuarios}
        onClose={() => setEditId(null)}
        onSaved={() => { setSuccess("Demanda atualizada com sucesso."); load(); }}
        onError={(msg) => setError(msg)}
      />

      <DemandaDetailModal
        open={!!detailId}
        demandaId={detailId}
        onClose={() => { setDetailId(null); load(); }}
      />

      <Modal open={!!editNew} onClose={() => setEditNew(null)} title="Nova Demanda" size="full"
        footer={<EditModalFooter onCancel={() => setEditNew(null)} onSave={saveNew} saving={saving} showSaveContinue={false} />}>
        {editNew && (
          <div className="demanda-form__grid">
            <Input label="Título *" className="span-2" value={editNew.titulo} onChange={(e) => setEditNew({ ...editNew, titulo: e.target.value })} />
            <Select label="Projeto *" value={editNew.projeto_id} onChange={(e) => setEditNew({ ...editNew, projeto_id: Number(e.target.value) })}>
              <option value="">Selecione...</option>
              {projetos.map((p) => <option key={p.id} value={p.id}>{p.codigo} — {p.nome}</option>)}
            </Select>
            <Select label="Fase inicial *" value={editNew.fase} onChange={(e) => setEditNew({ ...editNew, fase: e.target.value })}>
              {FASES_INICIAIS.map((f) => <option key={f} value={f}>{FASES_LABEL[f]}</option>)}
            </Select>
            <Input label="Prazo previsto *" type="date" value={editNew.data_prevista_termino?.slice(0, 10) || ""} onChange={(e) => setEditNew({ ...editNew, data_prevista_termino: e.target.value })} />
            <Textarea label="Descrição detalhada *" className="span-2" rows={5} value={editNew.descricao_detalhada || ""} onChange={(e) => setEditNew({ ...editNew, descricao_detalhada: e.target.value })} />
            <Textarea label="Observações" className="span-2" value={editNew.observacoes_demanda || ""} onChange={(e) => setEditNew({ ...editNew, observacoes_demanda: e.target.value })} />
            <div className="span-2">
              <span className="ui-field__label">Links relacionados</span>
              {links.map((l, i) => (
                <div key={i} className="link-row">
                  <Input placeholder="Título" value={l.titulo} onChange={(e) => { const n = [...links]; n[i].titulo = e.target.value; setLinks(n); }} />
                  <Input placeholder="URL" value={l.url} onChange={(e) => { const n = [...links]; n[i].url = e.target.value; setLinks(n); }} />
                </div>
              ))}
              <Button size="sm" variant="ghost" onClick={() => setLinks([...links, { titulo: "", url: "" }])}>+ Link</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
