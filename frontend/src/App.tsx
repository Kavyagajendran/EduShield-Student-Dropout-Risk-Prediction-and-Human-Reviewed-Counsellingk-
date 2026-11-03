import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/common/Navbar";
import { Sidebar } from "./components/common/Sidebar";

// Pages
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { StudentDirectory } from "./pages/StudentDirectory";
import { StudentProfile } from "./pages/StudentProfile";
import { ExplainableAI } from "./pages/ExplainableAI";
import { ModelBenchmark } from "./pages/ModelBenchmark";
import { CounsellingHub } from "./pages/CounsellingHub";
import { CSVImportPage } from "./pages/CSVImportPage";
import { ReportsPage } from "./pages/ReportsPage";
import { AuditLogsPage } from "./pages/AuditLogsPage";
import { StudentPortal } from "./pages/StudentPortal";

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-medium">Initializing EduShield session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedLayout>
                <StudentDirectory />
              </ProtectedLayout>
            }
          />
          <Route
            path="/students/:studentId"
            element={
              <ProtectedLayout>
                <StudentProfile />
              </ProtectedLayout>
            }
          />
          <Route
            path="/my-portal"
            element={
              <ProtectedLayout>
                <StudentPortal />
              </ProtectedLayout>
            }
          />
          <Route
            path="/explainability"
            element={
              <ProtectedLayout>
                <ExplainableAI />
              </ProtectedLayout>
            }
          />
          <Route
            path="/models"
            element={
              <ProtectedLayout>
                <ModelBenchmark />
              </ProtectedLayout>
            }
          />
          <Route
            path="/counselling"
            element={
              <ProtectedLayout>
                <CounsellingHub />
              </ProtectedLayout>
            }
          />
          <Route
            path="/import"
            element={
              <ProtectedLayout>
                <CSVImportPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedLayout>
                <ReportsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/audit"
            element={
              <ProtectedLayout>
                <AuditLogsPage />
              </ProtectedLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

