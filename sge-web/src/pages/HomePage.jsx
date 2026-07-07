import { useEffect, useState } from "react";
import { apiJson } from "sge-ui";

export default function HomePage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    apiJson("/home").then((r) => setData(r.data)).catch(console.error);
  }, []);

  if (!data) return <div className="sge-loading">Carregando...</div>;

  return (
    <div>
      <h2>{data.titulo}</h2>
      <p>Versão {data.versao} · Ano {data.ano} · UE {data.ue}</p>
      <div className="sge-home-grid">
        {data.modulos?.map((m) => (
          <div key={m.id} className="sge-home-card">
            <strong>{m.label}</strong>
            <span>{m.telas} telas</span>
          </div>
        ))}
      </div>
      <h3 style={{ marginTop: "1.5rem" }}>Atalhos</h3>
      <ul>
        {data.atalhos?.map((a) => (
          <li key={a.codigo}>{a.codigo} — {a.label}</li>
        ))}
      </ul>
    </div>
  );
}
