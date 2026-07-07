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

const TIPO_OPTS = [
  { value: "", label: "Todos os tipos" },
  { value: "manual", label: "Manual" },
  { value: "cronometro", label: "Cronômetro" },
];

const STATUS_OPTS = [
  { value: "", label: "Todos os status" },
  { value: "aguardando", label: "Aguardando" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluida", label: "Concluída" },
];

const TIPO_LABEL = { manual: "Manual", cronometro: "Cronômetro" };

const EXPORT_COLS = [
  { key: "data", label: "Data" },
  { key: "usuario_nome", label: "Usuário" },
  { key: "projeto_nome", label: "Projeto" },
  { key: "demanda_codigo", label: "Demanda" },
  { key: "atividade_titulo", label: "Atividade" },
  { key: "tarefa_titulo", label: "Tarefa" },
  { key: "duracao_minutos", label: "Horas", format: (r) => formatHoras((r.duracao_minutos || 0) / 60) },
  { key: "tipo", label: "Tipo", format: (r) => TIPO_LABEL[r.tipo] || r.tipo },
];

export default function ConsultaApontamentosPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1, totais: {} });
  const [filtros, setFiltros] = useState({ projeto_id: "", executor_id: "", tipo: "", status: "", data_de: "", data_ate: "" });
  const [opcoes, setOpcoes] = useState({ projetos: [], executores: [] });
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sort, setSort] = useState("data");
  const [order, setOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const debouncedQ = useDebouncedValue(q);

  useEffect(() => {
    apiJson("/consulta/apontamentos/filtros").then((r) => setOpcoes(r.data)).catch(() => {});
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
      const r = await apiJson(`/consulta/apontamentos?${buildParams()}`);
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

  const handleExport = async (type) => {
    setExporting(true);
    try {
      const r = await apiJson(`/consulta/apontamentos?${buildParams({ page: 1, limit: 5000, exportAll: true })}`);
      const exportRows = r.data;
      const stamp = new Date().toISOString().slice(0, 10);
      const subtitle = `Gerado em ${stamp} — ${exportRows.length} registro(s)`;
      const totals = [
        { label: "Total de registros", value: String(r.meta.totais?.total_registros || 0) },
        { label: "Total de horas", value: formatHoras(r.meta.totais?.total_horas) },
      ];
      if (type === "xlsx") {
        exportToExcel({ filename: `consulta-apontamentos-${stamp}`, sheetName: "Apontamentos", columns: EXPORT_COLS, rows: exportRows });
      } else {
        exportToPdf({ filename: `horas-trabalhadas-${stamp}`, title: "Horas Trabalhadas", subtitle, columns: EXPORT_COLS, rows: exportRows, totals });
      }
    } catch (e) { setError(e.message); }
    finally { setExporting(false); }
  };

  const columns = [
    { key: "data", label: "Data", sortable: true },
    { key: "usuario_nome", label: "Usuário", sortable: true },
    { key: "projeto_nome", label: "Projeto", sortable: true },
    { key: "demanda_codigo", label: "Demanda", sortable: true },
    { key: "atividade_titulo", label: "Atividade", sortable: true },
    { key: "tarefa_titulo", label: "Tarefa", sortable: true },
    { key: "duracao_minutos", label: "Horas", sortable: true, className: "text-right" },
    { key: "tipo", label: "Tipo", sortable: true },
  ];

  return (
    <>
      {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}

      <DataGrid
        title="Horas Trabalhadas"
        subtitle={isAdmin(user) ? "Auditoria completa de horas registradas" : "Exibindo apontamentos das tarefas das quais você é executor"}
        searchValue={q}
        onSearchChange={setQ}
        searchPlaceholder="Palavra-chave: tarefa, demanda, usuário, observação..."
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
            <Select label="" value={filtros.tipo} onChange={(e) => setF("tipo", e.target.value)}>
              {TIPO_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
            <Select label="" value={filtros.status} onChange={(e) => setF("status", e.target.value)}>
              {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
            <Input type="date" value={filtros.data_de} onChange={(e) => setF("data_de", e.target.value)} title="Período de" />
            <Input type="date" value={filtros.data_ate} onChange={(e) => setF("data_ate", e.target.value)} title="Período até" />
          </div>
        }
        renderRow={(r) => (
          <tr key={r.id}>
            <td>{r.data}</td>
            <td>{r.usuario_nome}</td>
            <td>{r.projeto_nome || "—"}</td>
            <td><strong>{r.demanda_codigo}</strong></td>
            <td>{r.atividade_titulo}</td>
            <td>{r.tarefa_titulo}</td>
            <td style={{ textAlign: "right" }}><strong>{formatHoras((r.duracao_minutos || 0) / 60)}</strong></td>
            <td><StatusBadge value={r.tipo} label={TIPO_LABEL[r.tipo] || r.tipo} /></td>
          </tr>
        )}
      />

      <div className="consulta-totals">
        <Card className="consulta-total-card">
          <span className="consulta-total-card__label">Registros</span>
          <strong className="consulta-total-card__value">{meta.totais?.total_registros || meta.total || 0}</strong>
        </Card>
        <Card className="consulta-total-card">
          <span className="consulta-total-card__label">Total de horas</span>
          <strong className="consulta-total-card__value">{formatHoras(meta.totais?.total_horas)}</strong>
        </Card>
      </div>

      {(meta.totais?.por_usuario?.length > 0 || meta.totais?.por_projeto?.length > 0) && (
        <div className="consulta-breakdown">
          {meta.totais.por_usuario?.length > 0 && (
            <Card>
              <h3 className="consulta-breakdown__title">Horas por usuário</h3>
              <div className="table-wrap">
                <table className="ui-table ui-table--compact">
                  <thead><tr><th>Usuário</th><th className="text-right">Horas</th><th className="text-right">Registros</th></tr></thead>
                  <tbody>
                    {meta.totais.por_usuario.map((u) => (
                      <tr key={u.id}><td>{u.nome}</td><td className="text-right">{formatHoras(u.total_horas)}</td><td className="text-right">{u.registros}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
          {meta.totais.por_projeto?.length > 0 && (
            <Card>
              <h3 className="consulta-breakdown__title">Horas por projeto</h3>
              <div className="table-wrap">
                <table className="ui-table ui-table--compact">
                  <thead><tr><th>Projeto</th><th className="text-right">Horas</th><th className="text-right">Registros</th></tr></thead>
                  <tbody>
                    {meta.totais.por_projeto.map((p) => (
                      <tr key={p.id}><td>{p.nome || "—"}</td><td className="text-right">{formatHoras(p.total_horas)}</td><td className="text-right">{p.registros}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
