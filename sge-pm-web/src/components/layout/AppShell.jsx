import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { apiJson } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { getEffectivePermissions, hasPermission, P } from "../../utils/permissions";
import { Button } from "../ui/Button";
import { PageLoader } from "../ui/Spinner";
import TimerWidget from "../timer/TimerWidget";
import NotificationBell from "./NotificationBell";

function filterByPermission(items, permissoes) {
  return items.filter((item) => hasPermission(permissoes, item.key, P.VIEW));
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuStructure, setMenuStructure] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(true);
  const [docOpen, setDocOpen] = useState(true);
  const [devOpen, setDevOpen] = useState(true);

  useEffect(() => {
    apiJson("/perfis/menus")
      .then((r) => setMenuStructure(r.data.structure))
      .catch(() => setMenuStructure(null));
  }, []);

  const permissoes = getEffectivePermissions(user);

  const groups = menuStructure || [];
  const principal = filterByPermission(groups.find((g) => g.grupo === "Principal")?.itens || [], permissoes);
  const devNav = filterByPermission(groups.find((g) => g.grupo === "Dev")?.itens || [], permissoes);
  const docNav = filterByPermission(groups.find((g) => g.grupo === "Material de Apoio")?.itens || [], permissoes);
  const adminNav = filterByPermission(groups.find((g) => g.grupo === "Administração")?.itens || [], permissoes);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  if (!menuStructure) return <PageLoader />;

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
          {principal.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `app-nav-item${isActive ? " active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="app-nav-item__icon" aria-hidden>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {devNav.length > 0 ? (
            <div key="nav-dev" className="nav-group">
              <button type="button" className={`nav-group__title${devOpen ? " open" : ""}`} onClick={() => setDevOpen((v) => !v)}>
                <span>💻 Dev</span>
                <span className="nav-group__chevron">{devOpen ? "▾" : "▸"}</span>
              </button>
              {devOpen && devNav.map((item) => (
                <NavLink key={item.key} to={item.path} className={({ isActive }) => `app-nav-item app-nav-item--nested${isActive ? " active" : ""}`} onClick={() => setSidebarOpen(false)}>
                  <span className="app-nav-item__icon" aria-hidden>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ) : null}

          {docNav.length > 0 ? (
            <div key="nav-doc" className="nav-group">
              <button type="button" className={`nav-group__title${docOpen ? " open" : ""}`} onClick={() => setDocOpen((v) => !v)}>
                <span>📄 Material de Apoio</span>
                <span className="nav-group__chevron">{docOpen ? "▾" : "▸"}</span>
              </button>
              {docOpen && docNav.map((item) => (
                <NavLink key={item.key} to={item.path} className={({ isActive }) => `app-nav-item app-nav-item--nested${isActive ? " active" : ""}`} onClick={() => setSidebarOpen(false)}>
                  <span className="app-nav-item__icon" aria-hidden>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ) : null}

          {adminNav.length > 0 ? (
            <div key="nav-admin" className="nav-group">
              <button type="button" className={`nav-group__title${adminOpen ? " open" : ""}`} onClick={() => setAdminOpen((v) => !v)}>
                <span>📁 Administração</span>
                <span className="nav-group__chevron">{adminOpen ? "▾" : "▸"}</span>
              </button>
              {adminOpen && adminNav.map((item) => (
                <NavLink key={item.key} to={item.path} className={({ isActive }) => `app-nav-item app-nav-item--nested${isActive ? " active" : ""}`} onClick={() => setSidebarOpen(false)}>
                  <span className="app-nav-item__icon" aria-hidden>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ) : null}
        </nav>

        <div className="app-sidebar__footer"><small>16Flow v4.0</small></div>
      </aside>

      <div className="app-main-wrap">
        <header className="app-header">
          <button type="button" className="app-header__menu" onClick={() => setSidebarOpen((v) => !v)} aria-label="Menu">☰</button>
          <div className="app-header__title">16Flow — Controle de atividades e horas</div>
          <TimerWidget />
          <NotificationBell />
          <div className="app-header__user">
            <div className="app-header__user-info">
              <strong>{user?.nome}</strong>
              <small>{user?.email}</small>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>Sair</Button>
          </div>
        </header>
        <main className="app-content"><Outlet /></main>
        <footer className="app-footer">
          <span>© {new Date().getFullYear()} 16Flow — Gestão de Demandas e Apontamento de Horas</span>
          <span>Produtividade · Rastreabilidade · Controle</span>
        </footer>
      </div>

      {sidebarOpen && (
        <button type="button" className="app-sidebar-backdrop" aria-label="Fechar menu" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
