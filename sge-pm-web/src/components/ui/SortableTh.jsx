export function SortableTh({ label, field, sort, order, onSort, className = "" }) {
  const active = sort === field;
  const arrow = active ? (order === "asc" ? " ▲" : " ▼") : "";
  return (
    <th
      className={`sortable-th${active ? " sortable-th--active" : ""} ${className}`.trim()}
      onClick={() => onSort(field)}
      title={`Ordenar por ${label}`}
    >
      {label}{arrow}
    </th>
  );
}
