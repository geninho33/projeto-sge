import { useCallback, useEffect, useState } from "react";
import { apiJson } from "../api/client";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { DataGrid } from "../components/ui/DataGrid";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { Alert } from "../components/ui/Alert";
import { StatusBadge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { STATUS_TAREFA_LABEL, formatHoras } from "../constants/tarefa";
import { exportToExcel, exportToPdf } from "../utils/exportData";
import { isAdmin } from "../utils/permissions";
import { useAuth } from "../context/AuthContext";

const STATUS_OPTS = [
  { value: "", label: "Todos os status" },
  { value: "aguardando", label: "Aguardando" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluida", label: "Concluída" },
];

const EXPORT_COLS = [
  { key: "projeto_nome", label: "Projeto" },
  { key: "demanda_codigo", label: "Demanda" },
  { key: "atividade_titulo", label: "Atividade" },
  { key: "titulo", label: "Tarefa" },
  { key: "executor_nome", label: "Executor" },
  { key: "status", label: "Status", format: (r) => STATUS_TAREFA_LABEL[r.status] || r.status },
  { key: "data_inicio", label: "Início", format: (r) => r.data_inicio?.slice(0, 10) || "—" },
  { key: "horas_apontadas", label: "Horas", format: (r) => formatHoras(r.horas_apontadas) },
];

export default function ConsultaTarefasPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1, totais: {} });
  const [filtros, setFiltros] = useState({ projeto_id: "", demanda_id: "", atividade_id: "", executor_id: "", status: "", backlog_id: "", data_inicio_de: "", data_inicio_ate: "" });
  const [opcoes, setOpcoes] = useState({ projetos: [], executores: [], backlogs: [] });
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sort, setSort] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const debouncedQ = useDebouncedValue(q);

  useEffect(() => {
    apiJson("/consulta/tarefas/filtros").then((r) => setOpcoes(r.data)).catch(() => {});
  }, []);

  const buildParams = useCallback((extra = {}) => {
    const params = new URLSearchParams({ page: String(extra.page ?? page), limit: String(extra.limit ?? limit), sort, order });
    if (debouncedQ) params.set("q", debouncedQ);
    Object.entries(filtros).forEach(([k, v]) => { if (v) params.set(k, v); });
    if (extra.exportAll) params.set("exportAll", "1");
    return params;
  }, [page, limit, sort, order, debouncedQ, filtros]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await apiJson(`/consulta/tarefas?${buildParams()}`);
      setRows(r.data);
      setMeta(r.meta);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [buildParams]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [debouncedQ, limit, filtros]);

  const handleSort = (f) => {
    if (sort === f) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSort(f); setOrder("asc"); }
    setPage(1);
  };

  const setF = (k, v) => setFiltros((prev) => ({ ...prev, [k]: v }));

  const fetchExportRows = async () => {
    const r = await apiJson(`/consulta/tarefas?${buildParams({ page: 1, limit: 5000, exportAll: true })}`);
    return { rows: r.data, meta: r.meta };
  };

  const handleExport = async (type) => {
    setExporting(true);
    try {
      const { rows: exportRows, meta: exportMeta } = await fetchExportRows();
      const stamp = new Date().toISOString().slice(0, 10);
      const subtitle = `Gerado em ${stamp} — ${exportRows.length} registro(s)`;
      const totals = [
        { label: "Total de tarefas", value: String(exportMeta.totais?.total_tarefas || 0) },
        { label: "Total de horas apontadas", value: formatHoras(exportMeta.totais?.total_horas) },
      ];
      if (type === "xlsx") {
        exportToExcel({ filename: `consulta-tarefas-${stamp}`, sheetName: "Tarefas", columns: EXPORT_COLS, rows: exportRows });
      } else {
        exportToPdf({ filename: `consulta-tarefas-${stamp}`, title: "Consulta de Tarefas", subtitle, columns: EXPORT_COLS, rows: exportRows, totals });
      }
    } catch (e) { setError(e.message); }
    finally { setExporting(false); }
  };

  const columns = [
    { key: "projeto_nome", label: "Projeto", sortable: true },
    { key: "demanda_codigo", label: "Demanda", sortable: true },
    { key: "atividade_titulo", label: "Atividade", sortable: true },
    { key: "titulo", label: "Tarefa", sortable: true },
    { key: "executor_nome", label: "Executor", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "data_inicio", label: "Início", sortable: true },
    { key: "horas_apontadas", label: "Horas", sortable: true, className: "text-right" },
  ];

  return (
    <>
      {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}

      <DataGrid
        title="Consultar Tarefas"
        subtitle={isAdmin(user) ? "Visão completa do sistema" : "Exibindo apenas tarefas das quais você é executor"}
        searchValue={q}
        onSearchChange={setQ}
        searchPlaceholder="Palavra-chave: tarefa, demanda, projeto, executor..."
        columns={columns}
        rows={rows}
        sort={sort}
        order={order}
        onSort={handleSort}
        page={meta.page || page}
        limit={meta.limit || limit}
        total={meta.total || 0}
        totalPages={meta.totalPages || 1}
        onPageChange={setPage}
        onLimitChange={(n) => { setLimit(n); setPage(1); }}
        loading={loading}
        actions={
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button variant="ghost" size="sm" loading={exporting} onClick={() => handleExport("pdf")}>PDF</Button>
            <Button variant="ghost" size="sm" loading={exporting} onClick={() => handleExport("xlsx")}>Excel</Button>
          </div>
        }
        toolbar={
          <div className="consulta-filters">
            <Select label="" value={filtros.projeto_id} onChange={(e) => setF("projeto_id", e.target.value)}>
              <option value="">Todos os projetos</option>
              {opcoes.projetos?.map((p) => <option key={p.id} value={p.id}>{p.codigo} — {p.nome}</option>)}
            </Select>
            <Select label="" value={filtros.executor_id} onChange={(e) => setF("executor_id", e.target.value)}>
              <option value="">Todos os executores</option>
              {opcoes.executores?.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </Select>
            <Select label="" value={filtros.status} onChange={(e) => setF("status", e.target.value)}>
              {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
            <Select label="" value={filtros.backlog_id} onChange={(e) => setF("backlog_id", e.target.value)}>
              <option value="">Todos os backlogs</option>
              {opcoes.backlogs?.map((b) => <option key={b.id} value={b.id}>{b.codigo} — {b.titulo}</option>)}
            </Select>
            <Input type="date" value={filtros.data_inicio_de} onChange={(e) => setF("data_inicio_de", e.target.value)} title="Início de" />
            <Input type="date" value={filtros.data_inicio_ate} onChange={(e) => setF("data_inicio_ate", e.target.value)} title="Início até" />
          </div>
        }
        renderRow={(r) => (
          <tr key={r.id}>
            <td>{r.projeto_nome || "—"}</td>
            <td><strong>{r.demanda_codigo}</strong></td>
            <td>{r.atividade_titulo}</td>
            <td>{r.titulo}</td>
            <td>{r.executor_nome || "—"}</td>
            <td><StatusBadge value={r.status} label={STATUS_TAREFA_LABEL[r.status] || r.status} /></td>
            <td>{r.data_inicio?.slice(0, 10) || "—"}</td>
            <td style={{ textAlign: "right" }}><strong>{formatHoras(r.horas_apontadas)}</strong></td>
          </tr>
        )}
      />

      <div className="consulta-totals">
        <Card className="consulta-total-card">
          <span className="consulta-total-card__label">Tarefas encontradas</span>
          <strong className="consulta-total-card__value">{meta.totais?.total_tarefas || meta.total || 0}</strong>
        </Card>
        <Card className="consulta-total-card">
          <span className="consulta-total-card__label">Horas apontadas</span>
          <strong className="consulta-total-card__value">{formatHoras(meta.totais?.total_horas)}</strong>
        </Card>
      </div>
    </>
  );
}
