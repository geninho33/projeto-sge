import { useState } from "react";
import { Button } from "../ui/Button";

export function KanbanColumnPicker({ allColumns, labels, visibleColumns, onToggle }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="kanban-col-picker">
      <Button size="sm" variant="ghost" onClick={() => setOpen(!open)}>⚙ Colunas</Button>
      {open && (
        <div className="kanban-col-picker__panel">
          <p className="kanban-col-picker__title">Fases visíveis</p>
          {allColumns.map((col) => (
            <label key={col} className="kanban-col-picker__item">
              <input
                type="checkbox"
                checked={visibleColumns.includes(col)}
                onChange={() => onToggle(col)}
              />
              <span>{labels[col] || col}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
