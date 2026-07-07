import { useEffect, useMemo, useRef, useState } from "react";

export function MultiSelect({
  label,
  placeholder = "Pesquisar...",
  options = [],
  value = [],
  onChange,
  getOptionValue = (o) => o.id,
  getOptionLabel = (o) => o.label,
  getOptionGroup = (o) => o.group,
  required,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef(null);

  const selectedSet = useMemo(() => new Set(value.map(String)), [value]);

  const sorted = useMemo(() => {
    return [...options].sort((a, b) => {
      const ga = (getOptionGroup(a) || "").localeCompare(getOptionGroup(b) || "");
      if (ga !== 0) return ga;
      return getOptionLabel(a).localeCompare(getOptionLabel(b));
    });
  }, [options, getOptionGroup, getOptionLabel]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return sorted;
    return sorted.filter((o) => {
      const label = getOptionLabel(o).toLowerCase();
      const group = (getOptionGroup(o) || "").toLowerCase();
      return label.includes(term) || group.includes(term);
    });
  }, [sorted, q, getOptionLabel, getOptionGroup]);

  const selectedOptions = useMemo(
    () => sorted.filter((o) => selectedSet.has(String(getOptionValue(o)))),
    [sorted, selectedSet, getOptionValue]
  );

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const toggle = (id) => {
    const s = String(id);
    if (selectedSet.has(s)) onChange(value.filter((v) => String(v) !== s));
    else onChange([...value, id]);
  };

  const remove = (id) => onChange(value.filter((v) => String(v) !== String(id)));

  return (
    <div className={`ui-field multi-select ${className}`.trim()} ref={wrapRef}>
      {label && (
        <span className={`ui-field__label${required ? " ui-field__label--required" : ""}`}>{label}</span>
      )}
      <div className={`multi-select__control${open ? " multi-select__control--open" : ""}`} onClick={() => setOpen(true)}>
        <div className="multi-select__chips">
          {selectedOptions.length === 0 && <span className="multi-select__placeholder">Selecione um ou mais itens...</span>}
          {selectedOptions.map((o) => (
            <span key={getOptionValue(o)} className="multi-select__chip">
              {getOptionGroup(o) && <small>{getOptionGroup(o)} · </small>}
              {getOptionLabel(o)}
              <button type="button" className="multi-select__chip-remove" onClick={(e) => { e.stopPropagation(); remove(getOptionValue(o)); }} aria-label="Remover">×</button>
            </span>
          ))}
        </div>
        <span className="multi-select__chevron" aria-hidden>▾</span>
      </div>
      {open && (
        <div className="multi-select__dropdown">
          <input
            className="multi-select__search ui-input"
            placeholder={placeholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
          />
          <ul className="multi-select__list" role="listbox">
            {filtered.length === 0 && <li className="multi-select__empty">Nenhum resultado</li>}
            {filtered.map((o) => {
              const id = getOptionValue(o);
              const checked = selectedSet.has(String(id));
              return (
                <li key={id}>
                  <button type="button" className={`multi-select__option${checked ? " selected" : ""}`} onClick={() => toggle(id)}>
                    <span className="multi-select__check">{checked ? "✓" : ""}</span>
                    <span>
                      {getOptionGroup(o) && <small className="multi-select__group">{getOptionGroup(o)}</small>}
                      <span>{getOptionLabel(o)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
