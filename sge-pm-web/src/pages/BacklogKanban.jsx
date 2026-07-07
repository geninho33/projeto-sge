import { useCallback, useEffect, useState } from "react";
import { apiJson } from "../api/client";
import { Card } from "../components/ui/Card";
import { PriorityBadge } from "../components/ui/Badge";
import { PageLoader } from "../components/ui/Spinner";
import { Alert } from "../components/ui/Alert";
import { FASES_LABEL } from "../constants/cores";

export default function BacklogKanban() {
  const [columns, setColumns] = useState(null);
  const [columnOrder, setColumnOrder] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    apiJson("/kanban")
      .then((r) => {
        setColumns(r.data.columns);
        setColumnOrder(r.data.columnOrder);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);

  if (!columns) return error ? <Alert type="error">{error}</Alert> : <PageLoader />;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Kanban de Progressão</h1>
          <p className="page-subtitle">Evolução automática dos backlogs conforme o andamento das atividades vinculadas</p>
        </div>
      </header>

      {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}

      <div className="kanban-board kanban-board--flow kanban-board--readonly">
        {columnOrder.map((colId) => (
          <div key={colId} className="kanban-column">
            <div className="kanban-column__header">
              <h3>{FASES_LABEL[colId] || colId}</h3>
              <span className="kanban-column__count">{(columns[colId] || []).length}</span>
            </div>
            <div className="kanban-column__body">
              {(columns[colId] || []).map((b) => (
                <Card key={b.codigo} className="kanban-card" hover={false}>
                  <div className="kanban-card__top">
                    <span className="proj-dot" style={{ background: b.projeto_cor || "#1E6FD9" }} />
                    <strong>{b.codigo}</strong>
                    <PriorityBadge value={b.prioridade} />
                  </div>
                  <p className="kanban-card__title">{b.titulo}</p>
                  <small className="text-muted">{b.projeto_nome || b.modulo || "—"}</small>
                  <div className="kanban-card__meta">
                    <span>📋 {b.total_atividades || 0} atividades</span>
                    {b.fase_progressao && b.fase_progressao !== "criacao" && (
                      <span>{FASES_LABEL[b.fase_progressao] || b.fase_progressao}</span>
                    )}
                    {b.responsavel_nome && <span>👤 {b.responsavel_nome}</span>}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
