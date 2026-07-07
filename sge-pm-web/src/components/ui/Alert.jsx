export function Alert({ type = "info", children, onClose }) {
  return (
    <div className={`ui-alert ui-alert--${type}`} role="alert">
      <span>{children}</span>
      {onClose && (
        <button type="button" className="ui-alert__close" onClick={onClose} aria-label="Fechar">
          ×
        </button>
      )}
    </div>
  );
}
