import { useEffect, useMemo, useState } from "react";
import { apiJson } from "../api/client";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Alert } from "../components/ui/Alert";
import { PageLoader } from "../components/ui/Spinner";
import { SortableTh } from "../components/ui/SortableTh";

const LADO_LABEL = { backend: "Backend", frontend: "Frontend", pm: "PM", qa: "QA" };

export default function SkillsPage() {
  const [matrix, setMatrix] = useState(null);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("codigo");
  const [order, setOrder] = useState("asc");

  const debouncedQ = useDebouncedValue(q);

  useEffect(() => {
    apiJson("/skills/matrix")
      .then((r) => setMatrix(r.data))
      .catch((e) => setError(e.message));
  }, []);

  const linkMap = useMemo(() => {
    const m = {};
    for (const l of matrix?.links || []) m[`${l.usuario_id}-${l.skill_id}`] = l.nivel;
    return m;
  }, [matrix]);

  const filteredSkills = useMemo(() => {
    if (!matrix) return [];
    let list = matrix.skills;
    if (debouncedQ) {
      const t = debouncedQ.toLowerCase();
      list = list.filter((s) =>
        s.codigo?.toLowerCase().includes(t) ||
        s.nome?.toLowerCase().includes(t) ||
        s.lado?.toLowerCase().includes(t)
      );
    }
    list = [...list].sort((a, b) => {
      const av = (a[sort] ?? "").toString().toLowerCase();
      const bv = (b[sort] ?? "").toString().toLowerCase();
      const cmp = av.localeCompare(bv);
      return order === "asc" ? cmp : -cmp;
    });
    return list;
  }, [matrix, debouncedQ, sort, order]);

  const handleSort = (field) => {
    if (sort === field) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSort(field); setOrder("asc"); }
  };

  if (error) return <Alert type="error">{error}</Alert>;
  if (!matrix) return <PageLoader />;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Skills</h1>
          <p className="page-subtitle">Competências da equipe e matriz de alocação</p>
        </div>
      </header>

      <Card className="data-grid-card" style={{ marginBottom: "1rem" }}>
        <h3 className="section-title">Matriz Usuário × Skill</h3>
        <div className="table-wrap">
          <table className="ui-table ui-table--compact skill-matrix-table">
            <thead>
              <tr>
                <th>Usuário / Perfil</th>
                {matrix.skills.map((s) => (
                  <th key={s.id} title={s.nome}>{s.codigo}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.usuarios.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.nome}</strong><br /><small className="text-muted">{u.perfil}</small></td>
                  {matrix.skills.map((s) => {
                    const nivel = linkMap[`${u.id}-${s.id}`];
                    return (
                      <td key={s.id} className={nivel ? "skill-cell--yes" : "skill-cell--no"}>
                        {nivel || "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="data-grid-card">
        <div className="toolbar-row" style={{ marginBottom: "1rem" }}>
          <Input
            placeholder="Buscar skill por código, nome ou categoria..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <h3 className="section-title">Catálogo de Skills ({filteredSkills.length})</h3>
        <div className="table-wrap">
          <table className="ui-table ui-table--hover">
            <thead>
              <tr>
                <SortableTh label="Código" field="codigo" sort={sort} order={order} onSort={handleSort} />
                <SortableTh label="Nome" field="nome" sort={sort} order={order} onSort={handleSort} />
                <SortableTh label="Categoria" field="lado" sort={sort} order={order} onSort={handleSort} />
                <SortableTh label="Nível mín." field="nivel_minimo" sort={sort} order={order} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {filteredSkills.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.codigo}</strong></td>
                  <td>{s.nome}</td>
                  <td>{LADO_LABEL[s.lado] || s.lado}</td>
                  <td>{s.nivel_minimo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
