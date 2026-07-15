import { useEffect, useMemo, useRef, useState } from "react";

export function SearchableSelect({
  label,
  placeholder = "Pesquisar...",
  options = [],
  value = null,
  onChange,
  onSearchChange,
  getOptionValue = (o) => o.id,
  getOptionLabel = (o) => o.label,
  getOptionSubLabel,
  required,
  className = "",
  disabled = false,
  emptyMessage = "Nenhum resultado",
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef(null);

  const selected = useMemo(
    () => options.find((o) => String(getOptionValue(o)) === String(value)) || null,
    [options, value, getOptionValue]
  );

  const filtered = useMemo(() => {
    if (onSearchChange) return options;
    const term = q.trim().toLowerCase();
    if (!term) return options;
    return options.filter((o) => {
      const label = getOptionLabel(o).toLowerCase();
      const sub = (getOptionSubLabel?.(o) || "").toLowerCase();
      return label.includes(term) || sub.includes(term);
    });
  }, [options, q, getOptionLabel, getOptionSubLabel, onSearchChange]);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleSearch = (val) => {
    setQ(val);
    onSearchChange?.(val);
  };

  return (
    <div className={`ui-field searchable-select ${className}`.trim()} ref={wrapRef}>
      {label && (
        <span className={`ui-field__label${required ? " ui-field__label--required" : ""}`}>{label}</span>
      )}
      <button
        type="button"
        className={`searchable-select__control${open ? " searchable-select__control--open" : ""}${disabled ? " searchable-select__control--disabled" : ""}`}
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
      >
        <span className={selected ? "searchable-select__value" : "searchable-select__placeholder"}>
          {selected ? (
            <>
              {getOptionLabel(selected)}
              {getOptionSubLabel?.(selected) && (
                <small className="searchable-select__sub"> — {getOptionSubLabel(selected)}</small>
              )}
            </>
          ) : (
            "Selecione..."
          )}
        </span>
        <span className="searchable-select__chevron" aria-hidden>▾</span>
      </button>
      {open && !disabled && (
        <div className="searchable-select__dropdown">
          <input
            className="searchable-select__search ui-input"
            placeholder={placeholder}
            value={q}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
          <ul className="searchable-select__list" role="listbox">
            {filtered.length === 0 && <li className="searchable-select__empty">{emptyMessage}</li>}
            {filtered.map((o) => {
              const id = getOptionValue(o);
              const active = String(id) === String(value);
              return (
                <li key={id}>
                  <button
                    type="button"
                    className={`searchable-select__option${active ? " selected" : ""}`}
                    onClick={() => {
                      onChange(id, o);
                      setOpen(false);
                      setQ("");
                      onSearchChange?.("");
                    }}
                  >
                    <strong>{getOptionLabel(o)}</strong>
                    {getOptionSubLabel?.(o) && <small>{getOptionSubLabel(o)}</small>}
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
