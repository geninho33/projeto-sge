import { useEffect, useState } from "react";
import { apiJson } from "../api/client";
import { asArray } from "../utils/asArray";

export default function SprintBoard() {
  const [sprints, setSprints] = useState([]);
  const [itemsBySprint, setItemsBySprint] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    apiJson("/sprint?projeto_id=1")
      .then(async (r) => {
        const sprintList = asArray(r.data);
        setSprints(sprintList);
        const map = {};
        for (const s of sprintList) {
          const res = await apiJson(`/sprint/${s.id}/items`);
          map[s.id] = res.data;
        }
        setItemsBySprint(map);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="error">{error}</div>;
  if (!sprints.length) return <div className="loading">Carregando sprints...</div>;

  return (
    <div>
      <h2 className="page-title">Sprint Board</h2>
      <div className="sprint-board">
        {sprints.map((s) => (
          <div key={s.id} className="sprint-col card">
            <h3>Sprint {s.numero}</h3>
            <p style={{ fontSize: ".8rem", color: "var(--muted)", marginBottom: ".5rem" }}>{s.nome}</p>
            <p style={{ fontSize: ".75rem", marginBottom: ".75rem" }}>
              {s.points_alocados}/{s.capacity_points} pts · <em>{s.status}</em>
            </p>
            {(itemsBySprint[s.id] || []).map((item) => (
              <div key={item.codigo} className="kanban-card">
                <strong>{item.codigo}</strong>
                <span className={`badge badge-${item.prioridade}`}>{item.prioridade}</span>
                <div>{item.titulo}</div>
                <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>{item.story_points} pts</div>
              </div>
            ))}
            {!(itemsBySprint[s.id] || []).length && (
              <p style={{ fontSize: ".8rem", color: "var(--muted)" }}>Sem itens alocados</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
