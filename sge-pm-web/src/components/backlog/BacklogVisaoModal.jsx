import { useEffect, useState } from "react";
import { apiJson } from "../../api/client";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { StatusBadge, PriorityBadge } from "../ui/Badge";
import { PageLoader } from "../ui/Spinner";
import { Alert } from "../ui/Alert";

export function BacklogVisaoModal({ open, codigo, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [zoomImg, setZoomImg] = useState(false);

  const load = async () => {
    if (!codigo) return;
    setLoading(true);
    setError(null);
    try {
      const r = await apiJson(`/backlog/${codigo}/visao`);
      setData(r.data);
    } catch (e) {
      setError(e.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && codigo) {
      setZoomImg(false);
      load();
    }
  }, [open, codigo]);

  if (!open) return null;

  const b = data?.backlog;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={b ? `Visão — ${b.codigo}` : `Visão — ${codigo}`}
        size="xl"
        footer={<Button variant="ghost" onClick={onClose}>Fechar</Button>}
      >
        {loading && !data && <PageLoader />}
        {error && <Alert type="error">{error}</Alert>}

        {b && (
          <div className="backlog-visao">
            <section className="backlog-visao__header card-section">
              <div className="backlog-visao__header-top">
                <div>
                  <span className="backlog-visao__code">{b.codigo}</span>
                  <h3 className="backlog-visao__title">{b.titulo}</h3>
                  {b.modulo && <p className="text-muted backlog-visao__module">{b.modulo}</p>}
                </div>
                <div className="backlog-visao__badges">
                  <PriorityBadge value={b.prioridade} />
                  <StatusBadge value={b.kanban_status || b.status_geral || "backlog"} />
                </div>
              </div>
              <div className="backlog-visao__meta">
                <div><span>Projeto</span><strong>{b.projeto_nome || "—"}</strong></div>
                <div><span>Status</span><strong>{b.status_geral || b.kanban_status || "—"}</strong></div>
                <div><span>Demandas</span><strong>{b.total_demandas}</strong></div>
                <div><span>Responsável</span><strong>{b.responsavel_nome || "—"}</strong></div>
              </div>
              {b.descricao && (
                <div className="backlog-visao__desc">
                  <h4>Descrição</h4>
                  <p>{b.descricao}</p>
                </div>
              )}
            </section>

            <section className="backlog-visao__section card-section">
              <h4 className="backlog-visao__section-title">📷 Screenshot da aplicação</h4>
              {data.screenshot?.url ? (
                <div className="backlog-visao__screenshot-wrap">
                  <img
                    src={data.screenshot.url}
                    alt={`Screenshot ${b.codigo}`}
                    className="backlog-visao__screenshot"
                    onClick={() => setZoomImg(true)}
                    title="Clique para ampliar"
                  />
                  <p className="text-muted backlog-visao__hint">Clique na imagem para ampliar</p>
                </div>
              ) : (
                <p className="backlog-visao__empty">Nenhuma screenshot disponível para este backlog.</p>
              )}
            </section>

            <section className="backlog-visao__section card-section">
              <h4 className="backlog-visao__section-title">🌳 Árvore de dependências</h4>
              {data.dependencyTree?.content ? (
                <div className="backlog-visao__tree">
                  <pre>{data.dependencyTree.content}</pre>
                </div>
              ) : (
                <p className="backlog-visao__empty">Nenhuma árvore de dependências encontrada para este backlog.</p>
              )}
            </section>
          </div>
        )}
      </Modal>

      {zoomImg && data?.screenshot?.url && (
        <div className="backlog-visao__lightbox" onClick={() => setZoomImg(false)} role="presentation">
          <img src={data.screenshot.url} alt={`Screenshot ampliada ${b?.codigo}`} onClick={(e) => e.stopPropagation()} />
          <button type="button" className="backlog-visao__lightbox-close" onClick={() => setZoomImg(false)}>×</button>
        </div>
      )}
    </>
  );
}
