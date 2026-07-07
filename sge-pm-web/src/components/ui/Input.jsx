export function Input({ label, error, hint, id, className = "", ...props }) {
  const inputId = id || props.name;
  return (
    <label className={`ui-field ${className}`.trim()} htmlFor={inputId}>
      {label && <span className="ui-field__label">{label}</span>}
      <input id={inputId} className={`ui-input${error ? " ui-input--error" : ""}`} {...props} />
      {error && <span className="ui-field__error">{error}</span>}
      {hint && !error && <span className="ui-field__hint">{hint}</span>}
    </label>
  );
}

export function Select({ label, error, children, id, className = "", ...props }) {
  const selectId = id || props.name;
  return (
    <label className={`ui-field ${className}`.trim()} htmlFor={selectId}>
      {label && <span className="ui-field__label">{label}</span>}
      <select id={selectId} className={`ui-input ui-select${error ? " ui-input--error" : ""}`} {...props}>
        {children}
      </select>
      {error && <span className="ui-field__error">{error}</span>}
    </label>
  );
}

export function Textarea({ label, error, id, className = "", ...props }) {
  const areaId = id || props.name;
  return (
    <label className={`ui-field ${className}`.trim()} htmlFor={areaId}>
      {label && <span className="ui-field__label">{label}</span>}
      <textarea id={areaId} className={`ui-input ui-textarea${error ? " ui-input--error" : ""}`} {...props} />
      {error && <span className="ui-field__error">{error}</span>}
    </label>
  );
}
