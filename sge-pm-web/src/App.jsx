import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AppShell from "./components/layout/AppShell";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import MinhasDemandasPage from "./pages/MinhasDemandasPage";
import BacklogKanban from "./pages/BacklogKanban";
import BacklogList from "./pages/BacklogList";
import SprintBoard from "./pages/SprintBoard";
import SprintsPage from "./pages/SprintsPage";
import DemandasPage from "./pages/DemandasPage";
import MigracoesPage from "./pages/MigracoesPage";
import MapeamentoPage from "./pages/MapeamentoPage";
import SkillsPage from "./pages/SkillsPage";
import ProjetosPage from "./pages/ProjetosPage";
import PerfisPage from "./pages/PerfisPage";
import TiposAtividadePage from "./pages/TiposAtividadePage";
import DemandasFlowPage from "./pages/DemandasFlowPage";
import DemandaDetailPage from "./pages/DemandaDetailPage";
import MeuKanbanPage from "./pages/MeuKanbanPage";
import UsuariosPerfisPage from "./pages/UsuariosPerfisPage";
import ConsultaTarefasPage from "./pages/ConsultaTarefasPage";
import ConsultaApontamentosPage from "./pages/ConsultaApontamentosPage";
import { PageLoader } from "./components/ui/Spinner";

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!["gestor", "tech_lead"].includes(user?.perfil)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <PrivateRoute>
            <AppShell />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="minhas-demandas" element={<MinhasDemandasPage />} />
        <Route path="meu-kanban" element={<MeuKanbanPage />} />
        <Route path="projetos" element={<AdminRoute><ProjetosPage /></AdminRoute>} />
        <Route path="demandas-flow" element={<DemandasFlowPage />} />
        <Route path="consulta/tarefas" element={<ConsultaTarefasPage />} />
        <Route path="consulta/apontamentos" element={<ConsultaApontamentosPage />} />
        <Route path="demandas-flow/:id" element={<DemandaDetailPage />} />
        <Route path="kanban" element={<BacklogKanban />} />
        <Route path="backlog" element={<BacklogList />} />
        <Route path="sprints" element={<SprintsPage />} /> {/* menu desativado — rota mantida */}
        <Route path="sprint-board" element={<SprintBoard />} />
        <Route path="demandas" element={<DemandasPage />} />

        <Route path="admin/perfis" element={<AdminRoute><PerfisPage /></AdminRoute>} />
        <Route path="admin/tipos-atividade" element={<AdminRoute><TiposAtividadePage /></AdminRoute>} />
        <Route path="admin/migracoes" element={<AdminRoute><MigracoesPage /></AdminRoute>} />
        <Route path="admin/mapeamento" element={<AdminRoute><MapeamentoPage /></AdminRoute>} />
        <Route path="admin/skills" element={<AdminRoute><SkillsPage /></AdminRoute>} />
        <Route path="admin/usuarios" element={<AdminRoute><UsuariosPerfisPage /></AdminRoute>} />

        {/* Redirecionamentos legados */}
        <Route path="migracoes" element={<Navigate to="/admin/migracoes" replace />} />
        <Route path="mapeamento" element={<Navigate to="/admin/mapeamento" replace />} />
        <Route path="skills" element={<Navigate to="/admin/skills" replace />} />
        <Route path="usuarios" element={<Navigate to="/admin/usuarios" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
