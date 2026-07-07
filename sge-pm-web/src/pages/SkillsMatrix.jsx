import { useEffect, useState } from "react";
import { apiJson } from "../api/client";

export default function SkillsMatrix() {
  const [matrix, setMatrix] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiJson("/skills/matrix")
      .then((r) => setMatrix(r.data))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="error">{error}</div>;
  if (!matrix) return <div className="loading">Carregando matriz...</div>;

  const linkMap = {};
  for (const l of matrix.links) {
    linkMap[`${l.usuario_id}-${l.skill_id}`] = l.nivel;
  }

  return (
    <div>
      <h2 className="page-title">Matriz de Competências</h2>
      <div className="card skill-matrix">
        <table>
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
                <td><strong>{u.nome}</strong><br /><small>{u.perfil}</small></td>
                {matrix.skills.map((s) => {
                  const nivel = linkMap[`${u.id}-${s.id}`];
                  return (
                    <td key={s.id} className={nivel ? "skill-yes" : ""}>
                      {nivel || "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card" style={{ marginTop: "1rem" }}>
        <h3>Catálogo de Skills</h3>
        <table>
          <thead><tr><th>Código</th><th>Nome</th><th>Lado</th><th>Nível mín.</th></tr></thead>
          <tbody>
            {matrix.skills.map((s) => (
              <tr key={s.id}>
                <td>{s.codigo}</td>
                <td>{s.nome}</td>
                <td>{s.lado}</td>
                <td>{s.nivel_minimo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
