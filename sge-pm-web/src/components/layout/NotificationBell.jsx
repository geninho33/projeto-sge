import { useCallback, useEffect, useRef, useState } from "react";
import { apiJson } from "../../api/client";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const r = await apiJson("/notificacoes?limit=15");
      setItems(r.data || []);
      setNaoLidas(r.meta?.nao_lidas ?? 0);
    } catch {
      /* silencioso — endpoint opcional */
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const marcarLida = async (id) => {
    try {
      const r = await apiJson(`/notificacoes/${id}/lida`, { method: "PATCH" });
      setNaoLidas(r.meta?.nao_lidas ?? 0);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, lida: 1 } : n)));
    } catch { /* ignore */ }
  };

  const marcarTodas = async () => {
    setLoading(true);
    try {
      await apiJson("/notificacoes/marcar-todas-lidas", { method: "POST" });
      setNaoLidas(0);
      setItems((prev) => prev.map((n) => ({ ...n, lida: 1 })));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  return (
    <div className="notif-bell" ref={panelRef}>
      <button
        type="button"
        className="notif-bell__btn"
        onClick={() => { setOpen((v) => !v); if (!open) load(); }}
        aria-label={`Notificações${naoLidas ? `, ${naoLidas} não lidas` : ""}`}
      >
        🔔
        {naoLidas > 0 && <span className="notif-bell__badge">{naoLidas > 9 ? "9+" : naoLidas}</span>}
      </button>

      {open && (
        <div className="notif-bell__panel">
          <div className="notif-bell__head">
            <strong>Atualizações</strong>
            {naoLidas > 0 && (
              <button type="button" className="link-btn" onClick={marcarTodas} disabled={loading}>
                Marcar todas como lidas
              </button>
            )}
          </div>
          <ul className="notif-bell__list">
            {items.length ? items.map((n) => (
              <li key={n.id} className={`notif-bell__item${n.lida ? " notif-bell__item--lida" : ""}`}>
                <div>
                  <strong>{n.titulo}</strong>
                  {n.mensagem && <p>{n.mensagem}</p>}
                  <small>{n.created_at?.slice(0, 16).replace("T", " ")}</small>
                </div>
                {!n.lida && (
                  <button type="button" className="link-btn" onClick={() => marcarLida(n.id)}>Lida</button>
                )}
              </li>
            )) : (
              <li className="notif-bell__empty">Nenhuma notificação.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
