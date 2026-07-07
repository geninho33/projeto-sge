import { useCallback, useEffect, useState } from "react";
import { apiJson } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { Modal } from "../ui/Modal";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Input";
import { StatusBadge, PriorityBadge } from "../ui/Badge";
import { Avatar } from "../ui/Avatar";
import { Alert } from "../ui/Alert";
import { PageLoader } from "../ui/Spinner";
import { FASES_LABEL, CORES_TIPO } from "../../constants/cores";
import { STATUS_ATIVIDADE_LABEL } from "../../constants/atividade";
import { STATUS_TAREFA_LABEL, formatHoras } from "../../constants/tarefa";
import { AtividadeModal } from "../atividade/AtividadeModal";
import { TarefaModal } from "../tarefa/TarefaModal";
import { ApontamentoModal } from "../tarefa/ApontamentoModal";
import { TimerModal } from "../tarefa/TimerModal";
import { canManageAtividadeTarefas, MSG_TAREFA_SEM_PERMISSAO } from "../../utils/permissions";

const SIDEBAR_TABS = [
  { id: "resumo", label: "Resumo", icon: "⊞" },
  { id: "tarefas", label: "Tarefas", icon: "☰" },
  { id: "comentarios", label: "Comentários", icon: "💬" },
  { id: "tramitacao", label: "Tramitação", icon: "⇄" },
];

export function DemandaDetailModal({ open, demandaId, onClose }) {
  const { user } = useAuth();
  const [demanda, setDemanda] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [tab, setTab] = useState("resumo");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tipos, setTipos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [backlogs, setBacklogs] = useState([]);
  const [atividadeModal, setAtividadeModal] = useState(null);
  const [tarefaModal, setTarefaModal] = useState(null);
  const [apontamentoModal, setApontamentoModal] = useState(null);
  const [timerModal, setTimerModal] = useState(null);
  const [selectedAtividade, setSelectedAtividade] = useState(null);
  const [comentario, setComentario] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [tramite, setTramite] = useState({ comentario: "" });
  const [avanco, setAvanco] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timerAtivo, setTimerAtivo] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    if (!demandaId) return;
    setLoading(true);
    try {
      const [d, h, a] = await Promise.all([
        apiJson(`/demandas/${demandaId}/completo`),
        apiJson(`/demandas/${demandaId}/historico`),
        apiJson(`/tramitacoes/${demandaId}/pode-avancar`).catch(() => ({ data: null })),
      ]);
      setDemanda(d.data);
      setHistorico(h.data);
      setAvanco(a.data);
      if (!selectedAtividade && d.data.atividades?.length) {
        setSelectedAtividade(d.data.atividades[0]);
      } else if (selectedAtividade) {
        const updated = d.data.atividades?.find((a) => a.id === selectedAtividade.id);
        if (updated) setSelectedAtividade(updated);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [demandaId]);

  useEffect(() => {
    if (!open) return;
    setTab("resumo");
    setError(null);
    setSuccess(null);
    setDemanda(null);
    setSelectedAtividade(null);
    load();
    apiJson("/timer/tarefa/ativo").then((r) => setTimerAtivo(r.data)).catch(() => {});
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
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
  }, [open]);

  const postComentario = async () => {
    if (!comentario.trim()) return;
    try {
      await apiJson("/comentarios", {
        method: "POST",
        body: JSON.stringify({ entidade_tipo: "demanda", entidade_id: Number(demandaId), parent_id: replyTo, texto: comentario }),
      });
      setComentario("");
      setReplyTo(null);
      load();
    } catch (e) { setError(e.message); }
  };

  const tramitar = async (faseNova) => {
    setSaving(true);
    try {
      await apiJson(`/tramitacoes/${demandaId}`, {
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

  const deleteTarefa = async (atividadeId, tarefaId) => {
    try {
      await apiJson(`/atividades/${atividadeId}/tarefas/${tarefaId}`, { method: "DELETE" });
      setConfirmDelete(null);
      load();
    } catch (e) {
      setConfirmDelete(null);
      setError(e.message);
    }
  };

  const requestDeleteTarefa = (atividadeId, tarefa) => {
    if ((tarefa.apontamentos?.length || 0) > 0 || (tarefa.total_apontamentos || 0) > 0) {
      setError("Esta tarefa não pode ser excluída porque possui apontamentos de horas registrados.");
      return;
    }
    setConfirmDelete({ atividadeId, tarefaId: tarefa.id, titulo: tarefa.titulo });
  };

  const handleApontamentoSaved = (data) => {
    if (data.tarefa) setTimerAtivo(data.timer ?? timerAtivo);
    load();
  };

  const handleTimerUpdate = (data) => {
    if (data.timer !== undefined) setTimerAtivo(data.timer);
    load();
  };

  const comentariosRaiz = (demanda?.comentarios || []).filter((c) => !c.parent_id);
  const canManageTarefas = canManageAtividadeTarefas(user, selectedAtividade);

  const openNovaTarefa = () => {
    if (!canManageAtividadeTarefas(user, selectedAtividade)) {
      setError(MSG_TAREFA_SEM_PERMISSAO);
      return;
    }
    setTarefaModal({ mode: "create" });
  };
  const respostas = (parentId) => (demanda?.comentarios || []).filter((c) => c.parent_id === parentId);
  const atividades = demanda?.atividades || [];
  const tarefaCount = atividades.reduce((sum, a) => sum + (a.tarefas?.length || 0), 0);
  const comentarioCount = (demanda?.comentarios || []).length;
  const tramitacaoCount = (demanda?.tramitacoes || []).length;

  const allApontamentos = [];
  if (selectedAtividade?.tarefas) {
    for (const t of selectedAtividade.tarefas) {
      for (const ap of (t.apontamentos || [])) {
        allApontamentos.push({ ...ap, tarefa_titulo: t.titulo });
      }
    }
  }
  allApontamentos.sort((a, b) => (b.data + b.hora_inicio).localeCompare(a.data + a.hora_inicio));

  return (
    <Modal open={open} onClose={onClose} title="" size="full">
      {loading && <PageLoader />}

      {demanda && !loading && (
        <div className="ddm">
          <header className="ddm__header">
            <div className="ddm__header-top">
              <h2 className="ddm__title">{demanda.titulo}</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
            </div>
            <div className="ddm__badges">
              <StatusBadge value={demanda.fase} label={FASES_LABEL[demanda.fase]} />
              {demanda.projeto_nome && <span className="ddm__badge-item">{demanda.projeto_nome}</span>}
              <PriorityBadge value={demanda.prioridade} />
              <span className="ddm__badge-item">{demanda.codigo}</span>
            </div>
            <div className="ddm__meta-row">
              {demanda.solicitante_nome && <span>Solicitante: <strong>{demanda.solicitante_nome}</strong></span>}
              {demanda.responsavel_nome && <span>Responsável: <strong>{demanda.responsavel_nome}</strong></span>}
              {(demanda.data_prevista_termino || demanda.prazo) && <span>Prazo: <strong>{(demanda.data_prevista_termino || demanda.prazo)?.slice(0, 10)}</strong></span>}
            </div>
          </header>

          {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}
          {success && <Alert type="success" onClose={() => setSuccess(null)}>{success}</Alert>}

          {selectedAtividade && (
            <div className="ddm__atividade-bar">
              <span className="ddm__atividade-bar-label">ATIVIDADE</span>
              <strong>{selectedAtividade.titulo}</strong>
              <span style={{ marginLeft: "auto" }}>{STATUS_ATIVIDADE_LABEL[selectedAtividade.status] || selectedAtividade.status}</span>
            </div>
          )}

          <div className="ddm__body">
            <nav className="ddm__sidebar">
              {SIDEBAR_TABS.map((t) => {
                const count = t.id === "tarefas" ? tarefaCount : t.id === "comentarios" ? comentarioCount : t.id === "tramitacao" ? tramitacaoCount : null;
                return (
                  <button key={t.id} type="button" className={`ddm__sidebar-item${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
                    <span className="ddm__sidebar-icon">{t.icon}</span>
                    <span>{t.label}</span>
                    {count !== null && <span className="ddm__sidebar-count">{count}</span>}
                  </button>
                );
              })}
            </nav>

            <div className="ddm__content">
              {tab === "resumo" && (
                <>
                  <Card>
                    <div className="demanda-desc">{demanda.descricao_detalhada || demanda.descricao || "Sem descrição."}</div>
                    {demanda.links?.length > 0 && (
                      <div className="link-list" style={{ marginTop: "1rem" }}>
                        <strong>Links</strong>
                        <ul>{demanda.links.map((l) => <li key={l.id}><a href={l.url} target="_blank" rel="noreferrer">{l.titulo}</a></li>)}</ul>
                      </div>
                    )}
                  </Card>
                  <div style={{ marginTop: "1rem" }}>
                    <h3 className="ddm__section-title">Atividades ({atividades.length})</h3>
                    <div className="ddm__atividades-list">
                      {atividades.map((a) => (
                        <button key={a.id} type="button" className={`ddm__atividade-item${selectedAtividade?.id === a.id ? " active" : ""}`}
                          onClick={() => { setSelectedAtividade(a); setTab("tarefas"); }}>
                          <div>
                            <strong>{a.titulo}</strong>
                            <p className="text-muted">{a.tipo_nome} · {STATUS_ATIVIDADE_LABEL[a.status] || a.status}</p>
                          </div>
                          <span className="ddm__atividade-arrow">›</span>
                        </button>
                      ))}
                      <Button size="sm" onClick={() => setAtividadeModal({ mode: "create" })} style={{ marginTop: "0.5rem" }}>+ Nova Atividade</Button>
                    </div>
                  </div>
                </>
              )}

              {tab === "tarefas" && selectedAtividade && (
                <>
                  {/* Tarefas header */}
                  <div className="tlist__header">
                    <div className="tlist__header-left">
                      <div className="tlist__icon">☰</div>
                      <div>
                        <h3 className="tlist__title">Tarefas <span className="tlist__count">{selectedAtividade.tarefas?.length || 0}</span></h3>
                        <p className="text-muted tlist__subtitle">Atividades vinculadas à demanda</p>
                      </div>
                    </div>
                    {canManageTarefas ? (
                      <Button size="sm" onClick={openNovaTarefa}>+ Nova tarefa</Button>
                    ) : (
                      <span className="text-muted" style={{ fontSize: "0.78rem" }}>Somente o executor da atividade pode gerenciar tarefas</span>
                    )}
                  </div>

                  {/* Task cards */}
                  <div className="tlist__cards">
                    {(selectedAtividade.tarefas || []).map((t) => {
                      const status = t.status || (t.concluida ? "concluida" : "aguardando");
                      const executor = usuarios.find((u) => u.id === t.executor_id);
                      return (
                        <div key={t.id} className="tlist__card">
                          <div className="tlist__card-top">
                            <div className="tlist__card-info">
                              <h4 className="tlist__card-title">{t.titulo}</h4>
                              {t.descricao && <p className="text-muted tlist__card-desc">{t.descricao}</p>}
                              <div className="tlist__card-tags">
                                {(t.data_inicio || t.data_prevista_termino) && (
                                  <span className="tlist__tag">📅 {(t.data_inicio || t.data_prevista_termino)?.slice(0, 10)}</span>
                                )}
                                {t.backlogs?.length > 0 && t.backlogs.map((b) => (
                                  <span key={b.id} className="tlist__tag tlist__tag--code">⚡ {b.codigo}</span>
                                ))}
                                <span className="tlist__tag tlist__tag--time">⏱ {formatHoras(t.horas_apontadas)}</span>
                              </div>
                            </div>
                            <div className="tlist__card-right">
                              <Avatar name={executor?.nome || t.executor_nome} src={executor?.avatar_url} size={36} />
                              <StatusBadge value={status} label={STATUS_TAREFA_LABEL[status] || status} />
                            </div>
                          </div>
                          {canManageTarefas && (
                            <div className="tlist__card-actions">
                              <Button size="sm" variant="ghost" onClick={() => setTimerModal(t)}>⏱ Timer</Button>
                              <Button size="sm" variant="ghost" onClick={() => setApontamentoModal(t)}>📋 Apontar</Button>
                              <Button size="sm" variant="ghost" onClick={() => setTarefaModal({ mode: "edit", tarefa: t })}>✏️ Editar</Button>
                              <Button size="sm" variant="danger" onClick={() => requestDeleteTarefa(selectedAtividade.id, t)}>🗑 Excluir</Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {(!selectedAtividade.tarefas || selectedAtividade.tarefas.length === 0) && (
                      <p className="text-muted" style={{ padding: "1rem" }}>Nenhuma tarefa cadastrada nesta atividade.</p>
                    )}
                  </div>

                  {/* Apontamentos da demanda */}
                  {allApontamentos.length > 0 && (
                    <div className="tlist__apontamentos">
                      <h3 className="tlist__title" style={{ marginTop: "1.5rem" }}>Apontamentos da demanda</h3>
                      <p className="text-muted tlist__subtitle">Resumo dos registros de tempo</p>
                      <div className="table-wrap" style={{ marginTop: "0.75rem" }}>
                        <table className="ui-table ui-table--hover">
                          <thead>
                            <tr>
                              <th>Dev</th>
                              <th>Data</th>
                              <th>Tarefa</th>
                              <th>Observação</th>
                              <th style={{ textAlign: "right" }}>Tempo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allApontamentos.map((ap) => {
                              const apUser = usuarios.find((u) => u.id === ap.usuario_id);
                              return (
                                <tr key={ap.id}>
                                  <td>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                      <Avatar name={apUser?.nome || ap.usuario_nome} src={apUser?.avatar_url} size={28} />
                                    </div>
                                  </td>
                                  <td>
                                    <div>{ap.data}</div>
                                    {ap.hora_inicio && ap.hora_inicio !== "00:00" && <small className="text-muted">{ap.hora_inicio}</small>}
                                  </td>
                                  <td>{ap.tarefa_titulo}</td>
                                  <td><span className="text-muted">{ap.comentario ? (ap.comentario.length > 50 ? ap.comentario.slice(0, 50) + "..." : ap.comentario) : "—"}</span></td>
                                  <td style={{ textAlign: "right" }}><strong>{formatHoras((ap.duracao_minutos || 0) / 60)}</strong></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}

              {tab === "tarefas" && !selectedAtividade && (
                <Alert type="info">Selecione uma atividade na aba Resumo para visualizar suas tarefas.</Alert>
              )}

              {tab === "comentarios" && (
                <Card>
                  <Textarea label="Novo comentário" value={comentario} onChange={(e) => setComentario(e.target.value)} rows={3} placeholder="Escreva seu comentário..." />
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
                    <h3>Histórico ({tramitacaoCount})</h3>
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
            </div>
          </div>

          <AtividadeModal
            open={!!atividadeModal}
            initial={atividadeModal?.mode === "edit" ? atividadeModal.atividade : null}
            demanda={demanda}
            demandaId={demandaId}
            userId={user?.id}
            tipos={tipos}
            usuarios={usuarios}
            projetos={projetos}
            backlogs={backlogs}
            onClose={() => setAtividadeModal(null)}
            onSaved={(msg) => { setSuccess(msg); load(); }}
            onError={(msg) => setError(msg)}
          />

          {selectedAtividade && (
            <>
              <TarefaModal
                open={!!tarefaModal}
                tarefa={tarefaModal?.mode === "edit" ? tarefaModal.tarefa : null}
                atividadeId={selectedAtividade.id}
                userId={user?.id}
                usuarios={usuarios}
                timerAtivo={timerAtivo}
                onClose={() => setTarefaModal(null)}
                onSaved={() => load()}
                onError={(msg) => setError(msg)}
              />
              <ApontamentoModal
                open={!!apontamentoModal}
                tarefa={apontamentoModal}
                atividadeId={selectedAtividade.id}
                onClose={() => setApontamentoModal(null)}
                onSaved={handleApontamentoSaved}
                onError={(msg) => setError(msg)}
              />
              <TimerModal
                open={!!timerModal}
                tarefa={timerModal}
                atividadeId={selectedAtividade.id}
                timerAtivo={timerAtivo}
                onClose={() => setTimerModal(null)}
                onUpdate={handleTimerUpdate}
                onError={(msg) => setError(msg)}
                onOpenTarefa={(t) => setTarefaModal({ mode: "edit", tarefa: t })}
              />
            </>
          )}

          {/* Confirmação de exclusão */}
          <Modal
            open={!!confirmDelete}
            onClose={() => setConfirmDelete(null)}
            title="Confirmar exclusão"
            size="sm"
            footer={
              <>
                <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
                <Button variant="danger" onClick={() => deleteTarefa(confirmDelete.atividadeId, confirmDelete.tarefaId)}>Excluir</Button>
              </>
            }
          >
            <p>Tem certeza que deseja excluir a tarefa <strong>{confirmDelete?.titulo}</strong>?</p>
            <p className="text-muted" style={{ fontSize: "0.82rem" }}>Esta ação é irreversível e não poderá ser desfeita.</p>
          </Modal>
        </div>
      )}
    </Modal>
  );
}
