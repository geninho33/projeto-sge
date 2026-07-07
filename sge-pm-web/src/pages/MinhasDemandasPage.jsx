import { useCallback, useEffect, useState } from "react";
import { apiJson } from "../api/client";
import { useTimer } from "../context/TimerContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input, Select, Textarea } from "../components/ui/Input";
import { Modal, ModalActions } from "../components/ui/Modal";
import { PriorityBadge, StatusBadge } from "../components/ui/Badge";
import { Alert } from "../components/ui/Alert";
import { PageLoader } from "../components/ui/Spinner";

const SITUACOES = [
  ["nao_iniciada", "Não iniciada"],
  ["em_andamento", "Em andamento"],
  ["aguardando_revisao", "Aguardando revisão"],
  ["bloqueada", "Bloqueada"],
  ["concluida", "Concluída"],
];

function ProgressRing({ value, size = 64 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const id = "flowGradient";
  return (
    <svg width={size} height={size} className="progress-ring" style={{ transform: "none" }}>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0B1B32" />
          <stop offset="50%" stopColor="#1E6FD9" />
          <stop offset="100%" stopColor="#00D2FF" />
        </linearGradient>
      </defs>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <circle cx={size / 2} cy={size / 2} r={r} className="progress-ring__bg" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="progress-ring__fill"
          stroke={`url(#${id})`}
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </g>
      <text x="50%" y="50%" className="progress-ring__text" style={{ transform: "none" }}>{value}%</text>
    </svg>
  );
}

export default function MinhasDemandasPage() {
  const { timer, start, isRunning } = useTimer();
  const [demandas, setDemandas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [historico, setHistorico] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiJson("/demandas/minhas");
      setDemandas(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (d) => {
    setSelected(d);
    const [ap, hist] = await Promise.all([
      apiJson(`/demandas/${d.id}/apontamentos`),
      apiJson(`/demandas/${d.id}/historico`),
    ]);
    setSelected({ ...d, apontamentos: ap.data, historico: hist.data });
  };

  const openAndamento = (d) => {
    setForm({
      situacao_trabalho: d.situacao_trabalho || "nao_iniciada",
      percentual_execucao: d.percentual_execucao ?? 0,
      comentarios_tecnicos: d.comentarios_tecnicos || "",
      impedimentos: d.impedimentos || "",
      proximos_passos: d.proximos_passos || "",
    });
    setSelected(d);
    setModal("andamento");
  };

  const openManual = (d) => {
    setForm({
      demanda_id: d.id,
      data: new Date().toISOString().slice(0, 10),
      hora_inicio: "09:00",
      hora_fim: "10:00",
      comentario: "",
    });
    setSelected(d);
    setModal("manual");
  };

  const saveAndamento = async () => {
    setSaving(true);
    try {
      await apiJson(`/demandas/${selected.id}/andamento`, {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      setModal(null);
      load();
      if (selected) openDetail({ ...selected });
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const saveManual = async () => {
    setSaving(true);
    try {
      await apiJson("/apontamentos", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setModal(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStartTimer = async (d) => {
    try {
      await start(d.id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Minhas Demandas</h1>
          <p className="page-subtitle">Acompanhe suas atividades, aponte horas e atualize o progresso</p>
        </div>
      </header>

      {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}

      <div className="minhas-grid">
        <div className="minhas-list">
          {demandas.map((d) => (
            <Card
              key={d.id}
              hover
              className={`demanda-card${selected?.id === d.id ? " demanda-card--active" : ""}`}
              onClick={() => openDetail(d)}
            >
              <div className="demanda-card__head">
                <span className="demanda-card__code">{d.codigo}</span>
                <PriorityBadge value={d.prioridade} />
              </div>
              <h3>{d.titulo}</h3>
              <p className="demanda-card__proj">{d.projeto_nome} · {d.sprint_nome || "Sem sprint"}</p>
              <div className="demanda-card__meta">
                <StatusBadge value={d.situacao_trabalho} label={SITUACOES.find(([v]) => v === d.situacao_trabalho)?.[1]} />
                <span>{(d.horas_apontadas ?? 0).toFixed(1)}h / {(d.horas_estimadas ?? 0)}h</span>
              </div>
              <div className="progress-bar progress-bar--gradient">
                <div className="progress-bar__fill" style={{ width: `${d.percentual_execucao ?? 0}%` }} />
              </div>
              <div className="demanda-card__actions" onClick={(e) => e.stopPropagation()}>
                {timer?.demanda_id === d.id ? (
                  <span className="timer-active-badge">⏱ Cronômetro ativo</span>
                ) : (
                  <Button size="sm" variant="primary" onClick={() => handleStartTimer(d)} disabled={isRunning && timer}>
                    Iniciar timer
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => openManual(d)}>Apontar</Button>
                <Button size="sm" variant="ghost" onClick={() => openAndamento(d)}>Status</Button>
              </div>
            </Card>
          ))}
          {!demandas.length && (
            <Card><p className="text-muted">Nenhuma demanda atribuída a você no momento.</p></Card>
          )}
        </div>

        {selected && (
          <Card className="demanda-detail">
            <div className="demanda-detail__head">
              <div>
                <span className="demanda-card__code">{selected.codigo}</span>
                <h2>{selected.titulo}</h2>
              </div>
              <ProgressRing value={selected.percentual_execucao ?? 0} />
            </div>
            <p>{selected.descricao || "Sem descrição"}</p>
            <dl className="detail-dl">
              <div><dt>Projeto</dt><dd>{selected.projeto_nome}</dd></div>
              <div><dt>Sprint</dt><dd>{selected.sprint_nome || "—"}</dd></div>
              <div><dt>Início</dt><dd>{selected.data_inicio?.slice(0, 10) || "—"}</dd></div>
              <div><dt>Prazo</dt><dd>{selected.prazo?.slice(0, 10) || "—"}</dd></div>
              <div><dt>Horas</dt><dd>{(selected.horas_apontadas ?? 0).toFixed(1)}h apontadas / {selected.horas_estimadas ?? 0}h estimadas</dd></div>
            </dl>

            {selected.impedimentos && (
              <Alert type="warning">Impedimento: {selected.impedimentos}</Alert>
            )}

            <h4 className="section-title">Apontamentos</h4>
            <div className="table-wrap">
              <table className="ui-table ui-table--compact">
                <thead>
                  <tr><th>Data</th><th>Início</th><th>Fim</th><th>Duração</th><th>Tipo</th></tr>
                </thead>
                <tbody>
                  {(selected.apontamentos || []).map((a) => (
                    <tr key={a.id}>
                      <td>{a.data}</td>
                      <td>{a.hora_inicio}</td>
                      <td>{a.hora_fim}</td>
                      <td>{a.duracao_minutos} min</td>
                      <td>{a.tipo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h4 className="section-title">Histórico</h4>
            <ul className="historico-list">
              {(selected.historico || []).map((h) => (
                <li key={h.id}>
                  <strong>{h.usuario_nome || "Sistema"}</strong> — {h.acao}
                  <small>{h.created_at?.slice(0, 16)}</small>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <Modal
        open={modal === "andamento"}
        onClose={() => setModal(null)}
        title="Atualizar andamento"
        footer={<ModalActions onCancel={() => setModal(null)} onConfirm={saveAndamento} loading={saving} />}
      >
        <div className="form-grid">
          <Select label="Situação" value={form.situacao_trabalho} onChange={(e) => setForm({ ...form, situacao_trabalho: e.target.value })}>
            {SITUACOES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
          <Input label="% Conclusão" type="number" min={0} max={100} value={form.percentual_execucao} onChange={(e) => setForm({ ...form, percentual_execucao: Number(e.target.value) })} />
          <Textarea label="Comentários técnicos" className="span-2" value={form.comentarios_tecnicos} onChange={(e) => setForm({ ...form, comentarios_tecnicos: e.target.value })} />
          <Textarea label="Impedimentos" className="span-2" value={form.impedimentos} onChange={(e) => setForm({ ...form, impedimentos: e.target.value })} />
          <Textarea label="Próximos passos" className="span-2" value={form.proximos_passos} onChange={(e) => setForm({ ...form, proximos_passos: e.target.value })} />
        </div>
      </Modal>

      <Modal
        open={modal === "manual"}
        onClose={() => setModal(null)}
        title="Apontamento manual"
        footer={<ModalActions onCancel={() => setModal(null)} onConfirm={saveManual} loading={saving} confirmLabel="Registrar" />}
      >
        <div className="form-grid">
          <Input label="Data" type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
          <Input label="Hora início" type="time" value={form.hora_inicio} onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })} />
          <Input label="Hora fim" type="time" value={form.hora_fim} onChange={(e) => setForm({ ...form, hora_fim: e.target.value })} />
          <Textarea label="Comentário" className="span-2" value={form.comentario} onChange={(e) => setForm({ ...form, comentario: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
