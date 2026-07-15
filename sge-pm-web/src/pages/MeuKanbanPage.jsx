import { useCallback, useEffect, useMemo, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { apiJson } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PriorityBadge, StatusBadge } from "../components/ui/Badge";
import { PageLoader } from "../components/ui/Spinner";
import { Alert } from "../components/ui/Alert";
import { DemandaDetailModal } from "../components/demanda/DemandaDetailModal";
import { BacklogVisaoModal } from "../components/backlog/BacklogVisaoModal";
import { KanbanColumnPicker } from "../components/kanban/KanbanColumnPicker";
import { useKanbanColumns } from "../hooks/useKanbanColumns";
import { FASES_LABEL } from "../constants/cores";

const ALL_FASES = ["desenvolvimento", "homologacao", "aprovacao", "cancelada"];

export default function MeuKanbanPage() {
  const { user } = useAuth();
  const [columns, setColumns] = useState(null);
  const [allColumnOrder, setAllColumnOrder] = useState(ALL_FASES);
  const [error, setError] = useState(null);
  const [moving, setMoving] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [backlogCodigo, setBacklogCodigo] = useState(null);
  const [viewMode, setViewMode] = useState("kanban");

  const { visibleColumns, columnOrder, toggleColumn } = useKanbanColumns(user?.id, allColumnOrder, "atividades");

  const load = useCallback(() => {
    apiJson("/kanban-usuario")
      .then((r) => {
        setColumns(r.data.columns);
        setAllColumnOrder(r.data.columnOrder || ALL_FASES);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => { load(); }, [load]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;
    const demandaId = Number(draggableId);

    const sourceItems = Array.from(columns[sourceCol]);
    const destItems = Array.from(columns[destCol]);
    const [moved] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, { ...moved, fase: destCol });

    setColumns({ ...columns, [sourceCol]: sourceItems, [destCol]: destItems });
    setMoving(true);

    try {
      await apiJson("/kanban-usuario/move", {
        method: "PATCH",
        body: JSON.stringify({ demanda_id: demandaId, fase: destCol }),
      });
    } catch (e) {
      setError(e.message);
      load();
    } finally {
      setMoving(false);
    }
  };

  const listRows = useMemo(() => {
    if (!columns) return [];
    return allColumnOrder.flatMap((col) =>
      (columns[col] || []).map((d) => ({ ...d, fase_col: col }))
    );
  }, [columns, allColumnOrder]);

  const diasRestantes = (prazo) => {
    if (!prazo) return null;
    return Math.ceil((new Date(prazo) - new Date()) / 86400000);
  };

  if (!columns) return error ? <Alert type="error">{error}</Alert> : <PageLoader />;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Atividades</h1>
          <p className="page-subtitle">Atendimento de Atividades</p>
        </div>
        <div className="page-header__actions">
          <div className="view-toggle">
            <button type="button" className={`view-toggle__btn${viewMode === "kanban" ? " active" : ""}`} onClick={() => setViewMode("kanban")} title="Kanban">▦</button>
            <button type="button" className={`view-toggle__btn${viewMode === "lista" ? " active" : ""}`} onClick={() => setViewMode("lista")} title="Lista">☰</button>
          </div>
          {viewMode === "kanban" && (
            <KanbanColumnPicker
              allColumns={allColumnOrder}
              labels={FASES_LABEL}
              visibleColumns={visibleColumns}
              onToggle={toggleColumn}
            />
          )}
          {moving && <span className="kanban-moving">Sincronizando...</span>}
        </div>
      </header>

      {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}

      {viewMode === "kanban" ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="kanban-board kanban-board--flow">
            {columnOrder.map((colId) => (
              <Droppable key={colId} droppableId={colId}>
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className={`kanban-column${snapshot.isDraggingOver ? " kanban-column--over" : ""}`}>
                    <div className="kanban-column__header">
                      <h3>{FASES_LABEL[colId] || colId}</h3>
                      <span className="kanban-column__count">{(columns[colId] || []).length}</span>
                    </div>
                    <div className="kanban-column__body">
                      {(columns[colId] || []).map((d, index) => {
                        const dias = diasRestantes(d.data_prevista_termino);
                        return (
                          <Draggable key={String(d.id)} draggableId={String(d.id)} index={index}>
                            {(prov) => (
                              <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
                                <Card className={`kanban-card${d.atrasada ? " kanban-card--late" : ""}`} hover>
                                  <div className="kanban-card__top">
                                    <span className="proj-dot" style={{ background: d.projeto_cor || "#1E6FD9" }} />
                                    <strong>{d.codigo}</strong>
                                    {d.projeto_codigo && <span className="kanban-card__proj-code">{d.projeto_codigo}</span>}
                                    <PriorityBadge value={d.prioridade} />
                                  </div>
                                  <p className="kanban-card__title">{d.titulo}</p>
                                  {d.backlog_codigo && (
                                    <button
                                      type="button"
                                      className="kanban-card__backlog"
                                      title={`Abrir backlog ${d.backlog_codigo}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setBacklogCodigo(d.backlog_codigo);
                                      }}
                                    >
                                      <span className="kanban-card__backlog-icon" aria-hidden>📋</span>
                                      <span className="kanban-card__backlog-text">
                                        <strong>{d.backlog_codigo}</strong>
                                        <span>{d.backlog_titulo}</span>
                                      </span>
                                      {d.backlog_prioridade && <PriorityBadge value={d.backlog_prioridade} />}
                                    </button>
                                  )}
                                  <small className="text-muted">{d.projeto_nome}</small>
                                  <div className="kanban-card__meta">
                                    {d.minhas_tarefas > 0 && <span>☰ {d.minhas_tarefas}</span>}
                                    {d.total_comentarios > 0 && <span>💬 {d.total_comentarios}</span>}
                                    {d.total_tramitacoes > 0 && <span>⇄ {d.total_tramitacoes}</span>}
                                  </div>
                                  <div className="kanban-card__meta">
                                    <span>{Number(d.horas_apontadas || 0).toFixed(1)}h</span>
                                    {dias !== null && (
                                      <span className={dias < 0 ? "text-danger" : ""}>{dias < 0 ? `${Math.abs(dias)}d atraso` : `${dias}d restantes`}</span>
                                    )}
                                  </div>
                                  <div className="kanban-card__actions-row">
                                    <Button size="sm" variant="ghost" onClick={() => setDetailId(d.id)}>Detalhes</Button>
                                  </div>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      ) : (
        <Card className="data-grid-card">
          <div className="table-wrap">
            <table className="ui-table ui-table--hover">
              <thead>
                <tr>
                  <th>Operações</th>
                  <th>Código</th>
                  <th>Demanda</th>
                  <th>Projeto</th>
                  <th>Fase</th>
                  <th>Tarefas</th>
                  <th>Horas</th>
                </tr>
              </thead>
              <tbody>
                {listRows.length === 0 ? (
                  <tr><td colSpan={7} className="text-muted">Nenhuma demanda encontrada.</td></tr>
                ) : listRows.map((d) => (
                  <tr key={d.id}>
                    <td className="table-actions"><Button size="sm" variant="ghost" onClick={() => setDetailId(d.id)}>Detalhes</Button></td>
                    <td><strong>{d.codigo}</strong></td>
                    <td>
                      <div>{d.titulo}</div>
                      {d.backlog_codigo && (
                        <button
                          type="button"
                          className="kanban-card__backlog kanban-card__backlog--inline"
                          onClick={() => setBacklogCodigo(d.backlog_codigo)}
                        >
                          <span aria-hidden>📋</span> {d.backlog_codigo} — {d.backlog_titulo}
                          {d.backlog_prioridade && <PriorityBadge value={d.backlog_prioridade} />}
                        </button>
                      )}
                    </td>
                    <td>{d.projeto_nome || "—"}</td>
                    <td><StatusBadge value={d.fase_col} label={FASES_LABEL[d.fase_col] || d.fase_col} /></td>
                    <td>{d.minhas_tarefas || 0}</td>
                    <td>{Number(d.horas_apontadas || 0).toFixed(1)}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <DemandaDetailModal
        open={!!detailId}
        demandaId={detailId}
        onClose={() => { setDetailId(null); load(); }}
      />

      <BacklogVisaoModal
        open={!!backlogCodigo}
        codigo={backlogCodigo}
        onClose={() => setBacklogCodigo(null)}
      />
    </div>
  );
}
