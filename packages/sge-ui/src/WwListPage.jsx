import { useCallback, useEffect, useState } from "react";
import { apiJson } from "./api.js";

export default function WwListPage({ module, title }) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [sort, setSort] = useState(module.defaultSort || { orderBy: module.columns[0]?.key, orderDir: "asc" });
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
        orderBy: sort.orderBy,
        orderDir: sort.orderDir,
      });
      if (appliedQ) params.set("q", appliedQ);
      const res = await apiJson(`${module.apiPath}?${params}`);
      setData(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [module.apiPath, page, pageSize, appliedQ, sort]);

  useEffect(() => { load(); }, [load]);

  const toggleSort = (key) => {
    setSort((s) => ({
      orderBy: key,
      orderDir: s.orderBy === key && s.orderDir === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  };

  return (
    <div className="sge-list">
      <div className="sge-list-header">
        <h2>{title || module.title}</h2>
        <span className="sge-badge">{module.codigo}</span>
      </div>
      <div className="sge-filters">
        <input
          placeholder="Buscar..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (setAppliedQ(q), setPage(1))}
        />
        <button type="button" onClick={() => { setAppliedQ(q); setPage(1); }}>Filtrar</button>
      </div>
      {error && <div className="sge-error">{error}</div>}
      {loading ? (
        <div className="sge-loading">Carregando...</div>
      ) : (
        <>
          <div className="sge-table-wrap">
            <table className="sge-table">
              <thead>
                <tr>
                  {module.columns.map((col) => (
                    <th key={col.key}>
                      <button type="button" className="sge-sort-btn" onClick={() => toggleSort(col.key)}>
                        {col.label}
                        {sort.orderBy === col.key ? (sort.orderDir === "asc" ? " ↑" : " ↓") : ""}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id ?? row[module.columns[0]?.key]}>
                    {module.columns.map((col) => (
                      <td key={col.key}>{row[col.key] ?? "—"}</td>
                    ))}
                  </tr>
                ))}
                {!data.length && (
                  <tr><td colSpan={module.columns.length} style={{ textAlign: "center", color: "#888" }}>Nenhum registro</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="sge-pagination">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</button>
            <span>Página {meta.page} de {meta.totalPages} ({meta.total} registros)</span>
            <button type="button" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Próxima</button>
          </div>
        </>
      )}
    </div>
  );
}
