import { useState } from "react";
import { WwListPage, SgeShell } from "sge-ui";
import { AuthProvider, useAuth, useSgeContext } from "./context/AuthContext";
import { MENU, getModule } from "./data/modules";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ContextPage from "./pages/ContextPage";

function AppRoutes() {
  const { isAuthenticated, logout } = useAuth();
  const { context, updateContext } = useSgeContext();
  const [screen, setScreen] = useState("home");

  if (!isAuthenticated) return <LoginPage />;

  const module = getModule(screen);

  const renderContent = () => {
    if (screen === "home") return <HomePage />;
    if (screen === "mudar-ano-ue") return <ContextPage />;
    if (module?.apiPath) return <WwListPage module={module} />;
    return <p>Tela não configurada: {screen}</p>;
  };

  const menuItems = MENU.filter((m) => !m.section);

  return (
    <SgeShell
      context={context}
      onContextChange={updateContext}
      onLogout={logout}
      activeScreen={screen}
      onNavigate={setScreen}
      menu={menuItems}
    >
      {renderContent()}
    </SgeShell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
