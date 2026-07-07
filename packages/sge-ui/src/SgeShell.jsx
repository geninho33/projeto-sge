export default function SgeShell({ children, context, onContextChange, onLogout, activeScreen, onNavigate, menu }) {
  return (
    <div className="sge-app">
      <header className="sge-topbar">
        <strong>SGE</strong>
        <span className="sge-context">
          Ano:{" "}
          <select value={context.ano} onChange={(e) => onContextChange({ ...context, ano: e.target.value })}>
            {["2024", "2025", "2026"].map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          UE:{" "}
          <select value={context.ue} onChange={(e) => onContextChange({ ...context, ue: e.target.value })}>
            <option value="8105">8105 - EMEF FLORIANOPOLIS</option>
            <option value="8106">8106 - EMEF CENTRO</option>
          </select>
        </span>
        <button type="button" className="sge-logout" onClick={onLogout}>Sair</button>
      </header>
      <div className="sge-body">
        <nav className="sge-menu">
          {menu.map((m) => (
            <button
              key={m.id}
              type="button"
              className={activeScreen === m.id ? "active" : ""}
              onClick={() => onNavigate(m.id)}
            >
              {m.label}
            </button>
          ))}
        </nav>
        <main className="sge-content">{children}</main>
      </div>
    </div>
  );
}
