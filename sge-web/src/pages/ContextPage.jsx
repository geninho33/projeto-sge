import { useSgeContext } from "../context/AuthContext";

export default function ContextPage() {
  const { context, updateContext } = useSgeContext();

  return (
    <div>
      <h2>Mudar Ano / Unidade Escolar</h2>
      <p className="sge-hint">SGE-007 — Contexto global propagado via headers X-SGE-Ano e X-SGE-UE</p>
      <div className="sge-form">
        <label>
          Ano letivo
          <select value={context.ano} onChange={(e) => updateContext({ ...context, ano: e.target.value })}>
            {["2024", "2025", "2026"].map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <label>
          Unidade Escolar
          <select value={context.ue} onChange={(e) => updateContext({ ...context, ue: e.target.value })}>
            <option value="8105">8105 - EMEF FLORIANOPOLIS</option>
            <option value="8106">8106 - EMEF CENTRO</option>
          </select>
        </label>
      </div>
      <p style={{ marginTop: "1rem" }}>
        Contexto atual: <strong>Ano {context.ano}</strong>, <strong>UE {context.ue}</strong>
      </p>
    </div>
  );
}
