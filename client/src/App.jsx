import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import CreateProject from './pages/CreateProject';
import Masters from './pages/Masters';
import MyWork from './pages/MyWork';
import Layout from './components/Layout';

function ProtectedLayout() {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-loader">Loading PMS…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout><Outlet /></Layout>;
}

function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  return roles.includes(user?.role) ? children : <Navigate to="/" replace />;
}

export default function App() {
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<ProtectedLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="projects" element={<Projects />} />
      <Route path="projects/:id" element={<ProjectDetails />} />
      <Route path="work" element={<MyWork />} />
      <Route path="projects/new" element={<RoleRoute roles={['Tender Executive']}><CreateProject /></RoleRoute>} />
      <Route path="masters" element={<RoleRoute roles={['Tender Executive']}><Masters /></RoleRoute>} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
