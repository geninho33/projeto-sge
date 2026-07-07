import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiJson } from "../api/client";
import { Card } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/Badge";
import { Alert } from "../components/ui/Alert";
import { PageLoader } from "../components/ui/Spinner";
import { isAdmin } from "../utils/permissions";
import Dashboard from "./Dashboard";

const SIT_LABELS = {
  nao_iniciada: "Não iniciada",
  em_andamento: "Em andamento",
  aguardando_revisao: "Aguardando revisão",
  bloqueada: "Bloqueada",
  concluida: "Concluída",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const isGestor = isAdmin(user);
  const [gestor, setGestor] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(isGestor);

  useEffect(() => {
    if (!isGestor) return;
    setLoading(true);
    apiJson("/projeto/1/dashboard-gestor")
      .then((r) => setGestor(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [isGestor, user?.perfil, user?.perfisArr]);

  if (!isGestor) return <Dashboard />;

  if (loading) return <PageLoader />;
  if (error) return <Alert type="error">{error}</Alert>;

  const { resumo, demandas_por_situacao, horas_por_colaborador, horas_por_sprint, timers_ativos, evolucao_semanal, demandas_recentes } = gestor;
  const maxBar = Math.max(...(evolucao_semanal || []).map((e) => e.horas), 1);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard Gerencial</h1>
          <p className="page-subtitle">Indicadores da equipe, horas e evolução das entregas</p>
        </div>
        <Link to="/demandas" className="ui-btn ui-btn--primary ui-btn--md">Ver todas demandas</Link>
      </header>

      <div className="stat-grid">
        <Card hover className="stat-card stat-card--flow">
          <div className="stat-card__value">{resumo.em_andamento}</div>
          <div className="stat-card__label">Em andamento</div>
        </Card>
        <Card hover className="stat-card stat-card--success">
          <div className="stat-card__value">{resumo.concluidas}</div>
          <div className="stat-card__label">Concluídas</div>
        </Card>
        <Card hover className="stat-card stat-card--danger">
          <div className="stat-card__value">{resumo.atrasadas}</div>
          <div className="stat-card__label">Atrasadas</div>
        </Card>
        <Card hover className="stat-card stat-card--total">
          <div className="stat-card__value">{resumo.realizado_horas?.toFixed?.(0) ?? 0}h</div>
          <div className="stat-card__label">de {resumo.planejado_horas?.toFixed?.(0) ?? 0}h planejadas</div>
        </Card>
      </div>

      <div className="dashboard-grid">
        <Card>
          <h3 className="section-title">Horas por colaborador</h3>
          <div className="bar-chart">
            {(horas_por_colaborador || []).map((c) => (
              <div key={c.id} className="bar-chart__row">
                <span className="bar-chart__label">{c.nome}</span>
                <div className="bar-chart__track">
                  <div
                    className="bar-chart__fill"
                    style={{ width: `${Math.min(100, (c.horas / Math.max(...horas_por_colaborador.map((x) => x.horas), 1)) * 100)}%` }}
                  />
                </div>
                <span className="bar-chart__value">{c.horas?.toFixed(1)}h</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="section-title">Evolução (28 dias)</h3>
          <div className="mini-chart">
            {(evolucao_semanal || []).map((e) => (
              <div key={e.data} className="mini-chart__col" title={`${e.data}: ${e.horas?.toFixed(1)}h`}>
                <div className="mini-chart__bar" style={{ height: `${(e.horas / maxBar) * 100}%` }} />
                <small>{e.data?.slice(5)}</small>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="section-title">Timers ativos</h3>
          {(timers_ativos || []).length ? timers_ativos.map((t) => (
            <div key={t.usuario_id} className="timer-row">
              <strong>{t.usuario_nome}</strong>
              <span>{t.demanda_codigo} — {t.demanda_titulo?.slice(0, 40)}</span>
              <StatusBadge value={t.status} />
            </div>
          )) : <p className="text-muted">Nenhum cronômetro ativo no momento.</p>}
        </Card>

        <Card>
          <h3 className="section-title">Horas por Sprint</h3>
          <table className="ui-table ui-table--compact">
            <thead><tr><th>Sprint</th><th>Estimado</th><th>Realizado</th></tr></thead>
            <tbody>
              {(horas_por_sprint || []).map((s, i) => (
                <tr key={i}>
                  <td>{s.nome}</td>
                  <td>{s.horas_estimadas?.toFixed(1)}h</td>
                  <td>{s.horas?.toFixed(1)}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card>
        <h3 className="section-title">Demandas recentes</h3>
        <div className="table-wrap">
          <table className="ui-table">
            <thead>
              <tr><th>Código</th><th>Título</th><th>Responsável</th><th>Situação</th><th>%</th><th>Horas</th><th>Atualização</th></tr>
            </thead>
            <tbody>
              {(demandas_recentes || []).map((d) => (
                <tr key={d.id}>
                  <td><strong>{d.codigo}</strong></td>
                  <td>{d.titulo}</td>
                  <td>{d.responsavel_nome || "—"}</td>
                  <td><StatusBadge value={d.situacao_trabalho} label={SIT_LABELS[d.situacao_trabalho]} /></td>
                  <td>{d.percentual_execucao}%</td>
                  <td>{d.horas_apontadas?.toFixed(1)}h</td>
                  <td>{d.updated_at?.slice(0, 16)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
