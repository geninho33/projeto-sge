import { useEffect } from "react";
import { Button } from "./Button";

export function Modal({ open, onClose, title, children, footer, size = "md", compact = false }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="ui-modal-overlay" onClick={onClose} role="presentation">
      <div
        className={`ui-modal ui-modal--${size}${compact ? " ui-modal--compact" : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {title ? (
          <header className="ui-modal__header">
            <h2 id="modal-title">{title}</h2>
            <button type="button" className="ui-modal__close" onClick={onClose} aria-label="Fechar">
              ×
            </button>
          </header>
        ) : (
          <button type="button" className="ui-modal__close ui-modal__close--floating" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        )}
        <div className="ui-modal__body">{children}</div>
        {footer && <footer className="ui-modal__footer">{footer}</footer>}
      </div>
    </div>
  );
}

export function ModalActions({ onCancel, onConfirm, confirmLabel = "Salvar", loading, confirmVariant = "primary" }) {
  return (
    <>
      <Button variant="ghost" onClick={onCancel}>Fechar</Button>
      <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
    </>
  );
}
