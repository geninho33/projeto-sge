import { Button } from "./Button";

export function Pagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  limits = [10, 20, 50, 100],
}) {
  if (!total) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="pagination">
      <div className="pagination__info">
        Exibindo {from}–{to} de {total} registros
      </div>
      <div className="pagination__controls">
        <label className="pagination__limit">
          Por página
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="ui-input ui-select pagination__select"
          >
            {limits.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <div className="pagination__buttons">
          <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => onPageChange(1)} title="Primeira página">
            «
          </Button>
          <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => onPageChange(page - 1)} title="Página anterior">
            ‹
          </Button>
          <span className="pagination__page">{page} / {totalPages || 1}</span>
          <Button size="sm" variant="ghost" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} title="Próxima página">
            ›
          </Button>
          <Button size="sm" variant="ghost" disabled={page >= totalPages} onClick={() => onPageChange(totalPages)} title="Última página">
            »
          </Button>
        </div>
      </div>
    </div>
  );
}
