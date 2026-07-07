import { useCallback, useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { apiJson } from "../api/client";

import { useAuth } from "../context/AuthContext";

import { Card } from "../components/ui/Card";

import { Button } from "../components/ui/Button";

import { Textarea } from "../components/ui/Input";
import { StatusBadge, PriorityBadge } from "../components/ui/Badge";
import { Alert } from "../components/ui/Alert";
import { PageLoader } from "../components/ui/Spinner";
import { FASES_LABEL, CORES_TIPO } from "../constants/cores";

import { STATUS_ATIVIDADE_LABEL } from "../constants/atividade";

import { AtividadeModal } from "../components/atividade/AtividadeModal";

import { TarefasPanel } from "../components/tarefa/TarefasPanel";



const TABS = ["geral", "atividades", "comentarios", "tramitacao", "historico"];



export default function DemandaDetailPage() {

  const { id } = useParams();

  const { user } = useAuth();

  const [demanda, setDemanda] = useState(null);

  const [historico, setHistorico] = useState([]);

  const [tab, setTab] = useState("geral");

  const [error, setError] = useState(null);

  const [success, setSuccess] = useState(null);

  const [tipos, setTipos] = useState([]);

  const [usuarios, setUsuarios] = useState([]);

  const [projetos, setProjetos] = useState([]);

  const [backlogs, setBacklogs] = useState([]);

  const [atividadeModal, setAtividadeModal] = useState(null);

  const [comentario, setComentario] = useState("");

  const [replyTo, setReplyTo] = useState(null);

  const [tramite, setTramite] = useState({ comentario: "" });

  const [avanco, setAvanco] = useState(null);

  const [saving, setSaving] = useState(false);



  const load = useCallback(async () => {

    try {

      const [d, h, a] = await Promise.all([

        apiJson(`/demandas/${id}/completo`),

        apiJson(`/demandas/${id}/historico`),

        apiJson(`/tramitacoes/${id}/pode-avancar`).catch(() => ({ data: null })),

      ]);

      setDemanda(d.data);

      setHistorico(h.data);

      setAvanco(a.data);

    } catch (e) { setError(e.message); }

  }, [id]);

  const openNovaAtividade = useCallback(() => setAtividadeModal({ mode: "create" }), []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {

    Promise.all([

      apiJson("/tipos-atividade"),

      apiJson("/usuarios"),

      apiJson("/projetos?limit=200"),

      apiJson("/backlog?limit=500&sort=projeto_nome&order=asc"),

    ]).then(([t, u, p, b]) => {

      setTipos(t.data);

      setUsuarios(u.data);

      setProjetos(p.data);

      setBacklogs(b.data || []);

    }).catch(() => {});

  }, []);



  const updateAtividadeLocal = (atividadeId, patch) => {

    setDemanda((d) => ({

      ...d,

      atividades: d.atividades.map((a) => (a.id === atividadeId ? { ...a, ...patch } : a)),

    }));

  };



  const postComentario = async () => {
    if (!comentario.trim()) return;
    try {
      await apiJson("/comentarios", {
        method: "POST",
        body: JSON.stringify({ entidade_tipo: "demanda", entidade_id: Number(id), parent_id: replyTo, texto: comentario }),
      });
      setComentario("");
      setReplyTo(null);
      load();
    } catch (e) { setError(e.message); }
  };

  const tramitar = async (faseNova) => {
    setSaving(true);
    try {
      await apiJson(`/tramitacoes/${id}`, {
        method: "POST",
        body: JSON.stringify({ fase_nova: faseNova, comentario: tramite.comentario }),
      });
      setTramite({ comentario: "" });
      setSuccess("Tramitação registrada.");
      load();
    } catch (e) {
      const pending = e.pending;
      if (pending) setError(`Atividades pendentes: ${pending.map((p) => p.titulo).join(", ")}`);
      else setError(e.message);
    } finally { setSaving(false); }
  };

  if (!demanda && !error) return <PageLoader />;
  if (!demanda) return <Alert type="error">{error}</Alert>;

  const comentariosRaiz = (demanda.comentarios || []).filter((c) => !c.parent_id);
  const respostas = (parentId) => (demanda.comentarios || []).filter((c) => c.parent_id === parentId);

  return (

    <div className="page">

      <header className="page-header">

        <div>

          <Link to="/demandas-flow" className="text-muted">← Demandas</Link>

          <h1 className="page-title">{demanda.codigo} — {demanda.titulo}</h1>

          <p className="page-subtitle">{demanda.projeto_nome} · Fase: {FASES_LABEL[demanda.fase]}</p>

        </div>

        <StatusBadge value={demanda.fase} label={FASES_LABEL[demanda.fase]} />

      </header>



      {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}

      {success && <Alert type="success" onClose={() => setSuccess(null)}>{success}</Alert>}



      <nav className="tab-bar">

        {TABS.map((t) => (

          <button key={t} type="button" className={`tab-bar__item${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>

            {t === "geral" ? "Geral" : t === "atividades" ? "Atividades" : t === "comentarios" ? "Comentários" : t === "tramitacao" ? "Tramitação" : "Histórico"}

          </button>

        ))}

      </nav>



      {tab === "geral" && (

        <Card>

          <p><strong>Solicitante:</strong> {demanda.solicitante_nome}</p>

          <p><strong>Prazo:</strong> {demanda.data_prevista_termino?.slice(0, 10) || "—"}</p>

          <p><strong>Prioridade:</strong> <PriorityBadge value={demanda.prioridade} /></p>

          <div className="demanda-desc">{demanda.descricao_detalhada || demanda.descricao || "—"}</div>

          {demanda.links?.length > 0 && (

            <div className="link-list">

              <strong>Links</strong>

              <ul>{demanda.links.map((l) => <li key={l.id}><a href={l.url} target="_blank" rel="noreferrer">{l.titulo}</a></li>)}</ul>

            </div>

          )}

        </Card>

      )}



      {tab === "atividades" && (

        <>

          <div className="page-header" style={{ marginBottom: "1rem" }}>

            <h2>Atividades</h2>

            <Button onClick={openNovaAtividade}>Nova Atividade</Button>

          </div>

          <div className="grid-cards atividades-grid">

            {(demanda.atividades || []).map((a) => (

              <Card key={a.id} className="atividade-card" style={{ borderLeftColor: CORES_TIPO[a.tipo_cor] || "#1E6FD9" }}>

                <div className="atividade-card__header">

                  <div>

                    <strong className="atividade-card__title">{a.titulo}</strong>

                    <p className="text-muted">{a.tipo_nome} · {a.projeto_nome}</p>

                  </div>

                  <StatusBadge value={a.status} label={STATUS_ATIVIDADE_LABEL[a.status] || a.status} />

                </div>

                <dl className="atividade-card__meta">

                  <div><dt>Usuário Executor</dt><dd>{a.usuario_executor_nome || a.executor_nome}</dd></div>

                  <div><dt>Prazo</dt><dd>{a.data_prevista_termino?.slice(0, 10) || "—"}</dd></div>

                  <div><dt>Progresso</dt><dd>{a.percentual_execucao || 0}%</dd></div>

                </dl>

                <div className="progress-bar"><div className="progress-bar__fill" style={{ width: `${a.percentual_execucao || 0}%` }} /></div>

                {a.backlogs?.length > 0 && (

                  <div className="tag-list">

                    {a.backlogs.map((b) => <span key={b.id} className="tag" title={b.projeto_nome}>{b.codigo}</span>)}

                  </div>

                )}

                <TarefasPanel
                  atividadeId={a.id}
                  atividade={a}
                  tarefas={a.tarefas}
                  usuarios={usuarios}
                  userId={user?.id}
                  onUpdate={(data) => updateAtividadeLocal(a.id, {
                    status: data.status,
                    percentual_execucao: data.percentual_execucao,
                    tarefas: data.tarefas,
                  })}
                  onError={(msg) => setError(msg)}
                />

                <div className="demanda-card__actions">
                  <Button size="sm" variant="ghost" onClick={() => setAtividadeModal({ mode: "edit", atividade: a })}>Editar</Button>
                </div>

              </Card>

            ))}

          </div>

        </>

      )}



      {tab === "comentarios" && (

        <Card>

          <Textarea label="Novo comentário" value={comentario} onChange={(e) => setComentario(e.target.value)} rows={3} placeholder="Use @usuario para mencionar" />

          {replyTo && <small>Respondendo comentário #{replyTo} <Button size="sm" variant="ghost" onClick={() => setReplyTo(null)}>Fechar</Button></small>}

          <Button onClick={postComentario} style={{ marginTop: "0.5rem" }}>Publicar</Button>

          <div className="comment-thread">

            {comentariosRaiz.map((c) => (

              <div key={c.id} className="comment-item">

                <div className="comment-item__head"><strong>{c.autor_nome}</strong> <small>{c.created_at}</small></div>

                <p>{c.texto}</p>

                <Button size="sm" variant="ghost" onClick={() => setReplyTo(c.id)}>Responder</Button>

                {respostas(c.id).map((r) => (

                  <div key={r.id} className="comment-item comment-item--reply">

                    <div className="comment-item__head"><strong>{r.autor_nome}</strong> <small>{r.created_at}</small></div>

                    <p>{r.texto}</p>

                  </div>

                ))}

              </div>

            ))}

          </div>

        </Card>

      )}



      {tab === "tramitacao" && (

        <div className="tramitacao-grid">

          <Card>

            <h3>Avançar fase</h3>

            {avanco && !avanco.ok && (

              <Alert type="error">Atividades pendentes na fase atual impedem o avanço:

                <ul>{avanco.pending?.map((p) => <li key={p.id}>{p.titulo} ({p.tipo_nome})</li>)}</ul>

              </Alert>

            )}

            <p>Fase atual: <strong>{FASES_LABEL[demanda.fase]}</strong></p>

            {avanco?.proxima_fase && <p>Próxima fase: <strong>{FASES_LABEL[avanco.proxima_fase]}</strong></p>}

            <Textarea label="Comentário obrigatório" value={tramite.comentario} onChange={(e) => setTramite({ comentario: e.target.value })} rows={3} />

            <div className="demanda-card__actions">

              {avanco?.proxima_fase && (

                <Button loading={saving} disabled={!avanco.ok || !tramite.comentario.trim()} onClick={() => tramitar(avanco.proxima_fase)}>

                  Avançar para {FASES_LABEL[avanco.proxima_fase]}

                </Button>

              )}

              <Button variant="ghost" loading={saving} onClick={() => tramitar("cancelada")}>Cancelar demanda</Button>

            </div>

          </Card>

          <Card>

            <h3>Histórico de tramitação</h3>

            <ul className="timeline">

              {(demanda.tramitacoes || []).map((t) => (

                <li key={t.id}>

                  <strong>{FASES_LABEL[t.fase_anterior]} → {FASES_LABEL[t.fase_nova]}</strong>

                  <p>{t.comentario}</p>

                  <small>{t.usuario_nome} · {t.created_at}</small>

                </li>

              ))}

            </ul>

          </Card>

        </div>

      )}



      {tab === "historico" && (

        <Card>

          <ul className="timeline">

            {historico.map((h) => (

              <li key={h.id}>

                <strong>{h.acao}</strong> — {h.usuario_nome || "Sistema"}

                <small> {h.created_at}</small>

              </li>

            ))}

          </ul>

        </Card>

      )}



      <AtividadeModal
        open={!!atividadeModal}
        initial={atividadeModal?.mode === "edit" ? atividadeModal.atividade : null}
        demanda={demanda}
        demandaId={id}
        userId={user?.id}
        tipos={tipos}
        usuarios={usuarios}
        projetos={projetos}
        backlogs={backlogs}
        onClose={() => setAtividadeModal(null)}
        onSaved={(msg) => { setSuccess(msg); load(); }}
        onError={(msg) => setError(msg)}
      />

    </div>
  );
}


