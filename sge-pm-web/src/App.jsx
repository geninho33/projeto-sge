import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { getEffectivePermissions, hasPermission, P } from "./utils/permissions";
import AppShell from "./components/layout/AppShell";
import LoginPage from "./pages/LoginPage";
import ForbiddenPage from "./pages/ForbiddenPage";
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

function PermissionRoute({ menuKey, minLevel = P.VIEW, children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!hasPermission(getEffectivePermissions(user), menuKey, minLevel)) {
    return <ForbiddenPage menuKey={menuKey} />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<PrivateRoute><AppShell /></PrivateRoute>}>
        <Route index element={<PermissionRoute menuKey="dashboard"><DashboardPage /></PermissionRoute>} />
        <Route path="minhas-demandas" element={<PermissionRoute menuKey="demandas"><MinhasDemandasPage /></PermissionRoute>} />
        <Route path="meu-kanban" element={<PermissionRoute menuKey="meu_kanban"><MeuKanbanPage /></PermissionRoute>} />
        <Route path="projetos" element={<PermissionRoute menuKey="projetos"><ProjetosPage /></PermissionRoute>} />
        <Route path="demandas-flow" element={<PermissionRoute menuKey="demandas"><DemandasFlowPage /></PermissionRoute>} />
        <Route path="consulta/tarefas" element={<PermissionRoute menuKey="consulta_tarefas"><ConsultaTarefasPage /></PermissionRoute>} />
        <Route path="consulta/apontamentos" element={<PermissionRoute menuKey="consulta_apontamentos"><ConsultaApontamentosPage /></PermissionRoute>} />
        <Route path="demandas-flow/:id" element={<PermissionRoute menuKey="demandas"><DemandaDetailPage /></PermissionRoute>} />
        <Route path="kanban" element={<PermissionRoute menuKey="kanban"><BacklogKanban /></PermissionRoute>} />
        <Route path="backlog" element={<PermissionRoute menuKey="backlog"><BacklogList /></PermissionRoute>} />
        <Route path="sprints" element={<PermissionRoute menuKey="backlog"><SprintsPage /></PermissionRoute>} />
        <Route path="sprint-board" element={<PermissionRoute menuKey="backlog"><SprintBoard /></PermissionRoute>} />
        <Route path="demandas" element={<PermissionRoute menuKey="demandas_legado"><DemandasPage /></PermissionRoute>} />
        <Route path="admin/perfis" element={<PermissionRoute menuKey="admin_perfis"><PerfisPage /></PermissionRoute>} />
        <Route path="admin/tipos-atividade" element={<PermissionRoute menuKey="admin_tipos"><TiposAtividadePage /></PermissionRoute>} />
        <Route path="admin/migracoes" element={<PermissionRoute menuKey="admin_migracoes"><MigracoesPage /></PermissionRoute>} />
        <Route path="admin/mapeamento" element={<PermissionRoute menuKey="admin_mapeamento"><MapeamentoPage /></PermissionRoute>} />
        <Route path="admin/skills" element={<PermissionRoute menuKey="skills"><SkillsPage /></PermissionRoute>} />
        <Route path="admin/usuarios" element={<PermissionRoute menuKey="admin_usuarios"><UsuariosPerfisPage /></PermissionRoute>} />
        <Route path="migracoes" element={<Navigate to="/admin/migracoes" replace />} />
        <Route path="mapeamento" element={<Navigate to="/admin/mapeamento" replace />} />
        <Route path="skills" element={<Navigate to="/admin/skills" replace />} />
        <Route path="usuarios" element={<Navigate to="/admin/usuarios" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
