import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProjectDetail from "./pages/Projectdetail";

type View = "welcome" | "login" | "signup" | "dashboard" | "project";

function AppShell() {
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState<View>(isAuthenticated ? "dashboard" : "welcome");
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  function openProject(projectId: string) {
    setActiveProjectId(projectId);
    setView("project");
  }

  if (!isAuthenticated) {
    if (view === "login") {
      return <Login onSuccess={() => setView("dashboard")} onGoToSignup={() => setView("signup")} />;
    }
    if (view === "signup") {
      return <Signup onSuccess={() => setView("dashboard")} onGoToLogin={() => setView("login")} />;
    }
    return <Welcome onGetStarted={() => setView("signup")} onLogin={() => setView("login")} />;
  }

  if (view === "project" && activeProjectId) {
    return <ProjectDetail projectId={activeProjectId} onBack={() => setView("dashboard")} />;
  }

  return <Dashboard onOpenProject={openProject} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}