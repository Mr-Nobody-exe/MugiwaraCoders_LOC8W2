/**
 * App.jsx
 * Root router for the HackX app.
 * Routes are protected by role via <PrivateRoute>.
 */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Layout }          from "./components/Layout";

// Pages
import AuthPage            from "./pages/AuthPage";
import DashboardPage       from "./pages/DashboardPage";
import TeamPage            from "./pages/TeamPage";
import QRPage              from "./pages/QRPage";
import WorldMapPage        from "./pages/WorldMapPage";
import AdminTeamsPage      from "./pages/Admin/AdminTeamsPage";
import AdminEntryPage      from "./pages/Admin/AdminEntryPage";
import JudgeEvalPage       from "./pages/Judge/JudgeEvalPage";

import "./styles/global.css";
import "./styles/animations.css";

/* ── Guards ── */
function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user)   return <Navigate to="/auth" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user)    return <Navigate to="/dashboard" replace />;
  return children;
}

/* ── Router ── */
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />

      {/* Shared — all roles */}
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/world"     element={<PrivateRoute><WorldMapPage /></PrivateRoute>} />

      {/* Participant */}
      <Route path="/team" element={<PrivateRoute roles={["participant"]}><TeamPage /></PrivateRoute>} />
      <Route path="/qr"   element={<PrivateRoute roles={["participant"]}><QRPage  /></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin/teams"  element={<PrivateRoute roles={["admin"]}><AdminTeamsPage /></PrivateRoute>} />
      <Route path="/admin/entry"  element={<PrivateRoute roles={["admin"]}><AdminEntryPage /></PrivateRoute>} />

      {/* Judge */}
      <Route path="/judge/eval" element={<PrivateRoute roles={["judge"]}><JudgeEvalPage /></PrivateRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
