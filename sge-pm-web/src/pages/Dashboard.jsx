import { useEffect, useState } from "react";
import { apiJson } from "../api/client";
import { asArray } from "../utils/asArray";
import { Card } from "../components/ui/Card";
import { PriorityBadge, StatusBadge } from "../components/ui/Badge";
import { Alert } from "../components/ui/Alert";
import { PageLoader } from "../components/ui/Spinner";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiJson("/projeto/1/dashboard")
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <Alert type="error">{error}</Alert>;
  if (!data) return <PageLoader />;

  const byPriority = {};
  for (const row of asArray(data.totais)) {
    byPriority[row.prioridade] = (byPriority[row.prioridade] || 0) + Number(row.total);
  }
  const sprintsRows = asArray(data.sprints);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Visão geral da migração SGE e progresso das sprints</p>
        </div>
      </header>

      <div className="stat-grid">
        <Card hover className="stat-card stat-card--p1">
          <div className="stat-card__value">{byPriority.P1 || 0}</div>
          <div className="stat-card__label">Itens P1 — Crítico</div>
        </Card>
        <Card hover className="stat-card stat-card--p2">
          <div className="stat-card__value">{byPriority.P2 || 0}</div>
          <div className="stat-card__label">Itens P2</div>
        </Card>
        <Card hover className="stat-card stat-card--p3">
          <div className="stat-card__value">{byPriority.P3 || 0}</div>
          <div className="stat-card__label">Itens P3</div>
        </Card>
        <Card hover className="stat-card stat-card--total">
          <div className="stat-card__value">115</div>
          <div className="stat-card__label">Total de telas</div>
        </Card>
      </div>

      <Card>
        <h3 className="section-title">Sprints planejadas</h3>
        <div className="table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>Status</th>
                <th>Conclusão</th>
                <th>Capacity</th>
                <th>Alocado (pts)</th>
              </tr>
            </thead>
            <tbody>
              {sprintsRows.map((s) => (
                <tr key={s.id}>
                  <td>{s.numero}</td>
                  <td><strong>{s.nome}</strong></td>
                  <td><StatusBadge value={s.status} /></td>
                  <td>{s.percentual_conclusao ?? 0}%</td>
                  <td>{s.capacity_points}</td>
                  <td>{s.points_alocados}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
