import { useEffect, useState } from "react";

export function useKanbanColumns(userId, allColumns, storageKey = "default") {
  const storageId = userId ? `${storageKey}-${userId}` : storageKey;

  const [visible, setVisible] = useState(() => {
    try {
      const saved = localStorage.getItem(`kanban-cols-${storageId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch { /* ignore */ }
    return [...allColumns];
  });

  useEffect(() => {
    if (!userId) return;
    localStorage.setItem(`kanban-cols-${storageId}`, JSON.stringify(visible));
  }, [visible, userId, storageId]);

  useEffect(() => {
    setVisible((prev) => {
      const kept = prev.filter((c) => allColumns.includes(c));
      return kept.length ? kept : [...allColumns];
    });
  }, [allColumns.join(",")]);

  const columnOrder = allColumns.filter((c) => visible.includes(c));

  const toggleColumn = (col) => {
    setVisible((prev) => {
      if (prev.includes(col)) {
        if (prev.length <= 1) return prev;
        return prev.filter((c) => c !== col);
      }
      return [...prev, col];
    });
  };

  return { visibleColumns: visible, columnOrder, toggleColumn, setVisibleColumns: setVisible };
}
