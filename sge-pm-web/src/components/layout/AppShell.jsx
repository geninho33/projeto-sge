import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { hasPermission } from "../../utils/permissions";
import { Button } from "../ui/Button";
import TimerWidget from "../timer/TimerWidget";

const MAIN_NAV = [
  { to: "/", label: "Dashboard", icon: "◫", end: true, menuKey: "dashboard" },
  { to: "/demandas-flow", label: "Demandas", icon: "⇄", menuKey: "demandas" },
];

const DEV_NAV = [
  { to: "/meu-kanban", label: "Atividades", icon: "▣", menuKey: "meu_kanban" },
  { to: "/consulta/tarefas", label: "Consultar Tarefas", icon: "☰", menuKey: "consulta_tarefas" },
  { to: "/consulta/apontamentos", label: "Horas Trabalhadas", icon: "⏱", menuKey: "consulta_apontamentos" },
];

const DOC_NAV = [
  { to: "/kanban", label: "Kanban de Progressão", icon: "▦", menuKey: "kanban" },
  { to: "/backlog", label: "Backlog", icon: "☰", menuKey: "backlog" },
  { to: "/admin/skills", label: "Skills", icon: "★", menuKey: "skills" },
  { to: "/demandas", label: "Demandas (Legado)", icon: "⇄", menuKey: "demandas_legado" },
];

const ADMIN_NAV = [
  { to: "/projetos", label: "Projetos", icon: "◈", menuKey: "projetos" },
  { to: "/admin/perfis", label: "Perfis de Usuários", icon: "🔐", menuKey: "admin_perfis" },
  { to: "/admin/tipos-atividade", label: "Tipos de Atividade", icon: "◆", menuKey: "admin_tipos" },
  { to: "/admin/usuarios", label: "Usuários", icon: "👤", menuKey: "admin_usuarios" },
  { to: "/admin/migracoes", label: "Migrações", icon: "⬆", menuKey: "admin_migracoes" },
  { to: "/admin/mapeamento", label: "Mapeamento", icon: "⊞", menuKey: "admin_mapeamento" },
];

function filterByPermission(items, permissoes) {
  return items.filter((item) => hasPermission(permissoes, item.menuKey, 1));
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(true);
  const [docOpen, setDocOpen] = useState(true);
  const [devOpen, setDevOpen] = useState(true);

  const permissoes = user?.permissoes || {};
  const mainNav = filterByPermission(MAIN_NAV, permissoes);
  const devNav = filterByPermission(DEV_NAV, permissoes);
  const docNav = filterByPermission(DOC_NAV, permissoes);
  const adminNav = filterByPermission(ADMIN_NAV, permissoes);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className={`app-shell${sidebarOpen ? " app-shell--sidebar-open" : ""}`}>
      <aside className="app-sidebar">
        <div className="app-sidebar__brand">
          <img src="/logo-16flow.png" alt="16Flow" className="app-sidebar__logo-img" />
          <div>
            <strong className="brand-16">16<span className="brand-flow">flow</span></strong>
            <small>Gestão de Demandas</small>
          </div>
        </div>

        <nav className="app-sidebar__nav">
          {mainNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `app-nav-item${isActive ? " active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="app-nav-item__icon" aria-hidden>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {devNav.length > 0 && (
            <div className="nav-group">
              <button
                type="button"
                className={`nav-group__title${devOpen ? " open" : ""}`}
                onClick={() => setDevOpen((v) => !v)}
              >
                <span>💻 Dev</span>
                <span className="nav-group__chevron">{devOpen ? "▾" : "▸"}</span>
              </button>
              {devOpen && devNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `app-nav-item app-nav-item--nested${isActive ? " active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="app-nav-item__icon" aria-hidden>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}

          {docNav.length > 0 && (
            <div className="nav-group">
              <button
                type="button"
                className={`nav-group__title${docOpen ? " open" : ""}`}
                onClick={() => setDocOpen((v) => !v)}
              >
                <span>📄 Material de Apoio</span>
                <span className="nav-group__chevron">{docOpen ? "▾" : "▸"}</span>
              </button>
              {docOpen && docNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `app-nav-item app-nav-item--nested${isActive ? " active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="app-nav-item__icon" aria-hidden>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}

          {adminNav.length > 0 && (
            <div className="nav-group">
              <button
                type="button"
                className={`nav-group__title${adminOpen ? " open" : ""}`}
                onClick={() => setAdminOpen((v) => !v)}
              >
                <span>📁 Administração</span>
                <span className="nav-group__chevron">{adminOpen ? "▾" : "▸"}</span>
              </button>
              {adminOpen && adminNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `app-nav-item app-nav-item--nested${isActive ? " active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="app-nav-item__icon" aria-hidden>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}
        </nav>

        <div className="app-sidebar__footer">
          <small>16Flow v4.0</small>
        </div>
      </aside>

      <div className="app-main-wrap">
        <header className="app-header">
          <button
            type="button"
            className="app-header__menu"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Menu"
          >
            ☰
          </button>
          <div className="app-header__title">16Flow — Controle de atividades e horas</div>
          <TimerWidget />
          <div className="app-header__user">
            <div className="app-header__user-info">
              <strong>{user?.nome}</strong>
              <small>{user?.email}</small>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>Sair</Button>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>

        <footer className="app-footer">
          <span>© {new Date().getFullYear()} 16Flow — Gestão de Demandas e Apontamento de Horas</span>
          <span>Produtividade · Rastreabilidade · Controle</span>
        </footer>
      </div>

      {sidebarOpen && (
        <button
          type="button"
          className="app-sidebar-backdrop"
          aria-label="Fechar menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
