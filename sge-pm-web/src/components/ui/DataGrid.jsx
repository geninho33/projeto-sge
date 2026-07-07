import { Card } from "./Card";
import { Input } from "./Input";
import { Pagination } from "./Pagination";
import { SortableTh } from "./SortableTh";
import { PageLoader } from "./Spinner";

export function DataGrid({
  title,
  subtitle,
  searchPlaceholder = "Pesquisar...",
  searchValue,
  onSearchChange,
  toolbar,
  columns,
  rows,
  rowKey,
  renderRow,
  sort,
  order,
  onSort,
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  loading,
  emptyMessage = "Nenhum registro encontrado.",
  actions,
  showPagination = true,
}) {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions}
      </header>

      <Card className="toolbar-card data-grid-toolbar">
        <div className="toolbar-row">
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="data-grid-search"
          />
          {toolbar}
        </div>
      </Card>

      <Card className="data-grid-card">
        {loading && !rows.length ? (
          <PageLoader />
        ) : (
          <>
            <div className="table-wrap">
              <table className="ui-table ui-table--hover">
                <thead>
                  <tr>
                    {columns.map((col) =>
                      col.sortable ? (
                        <SortableTh
                          key={col.key}
                          label={col.label}
                          field={col.key}
                          sort={sort}
                          order={order}
                          onSort={onSort}
                          className={col.className}
                        />
                      ) : (
                        <th key={col.key} className={col.className}>{col.label}</th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.length ? rows.map((row) => renderRow(row)) : (
                    <tr>
                      <td colSpan={columns.length} className="data-grid-empty">{emptyMessage}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {showPagination && (
              <Pagination
                page={page}
                limit={limit}
                total={total}
                totalPages={totalPages}
                onPageChange={onPageChange}
                onLimitChange={onLimitChange}
              />
            )}
          </>
        )}
      </Card>
    </div>
  );
}
