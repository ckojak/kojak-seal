import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useEffect } from "react";

import AuthPage from "./pages/AuthPage";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import SelarManutencao from "./pages/SelarManutencao";
import Historico from "./pages/Historico";
import Certificado from "./pages/Certificado";
import Perfil from "./pages/Perfil";
import VehiclePublic from "./pages/VehiclePublic";
import AdminPanel from "./pages/AdminPanel";
import Onboarding from "./pages/Onboarding";
import Forbidden from "./pages/Forbidden";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Dark mode por padrão — Kojak Seal sempre escuro
function ThemeInitializer() {
  useEffect(() => {
    const stored = localStorage.getItem('kojak-theme');
    if (stored === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Padrão = dark (sem preferência ou preferência dark)
      document.documentElement.classList.add('dark');
      if (!stored) localStorage.setItem('kojak-theme', 'dark');
    }
  }, []);
  return null;
}

function AuthRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AuthPage />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <ThemeInitializer />
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AuthRedirect />} />
            <Route path="/auth" element={<AuthRedirect />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/v/:id" element={<VehiclePublic />} />
            <Route path="/onboarding" element={
              <ProtectedRoute><Onboarding /></ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/selar" element={
              <ProtectedRoute><SelarManutencao /></ProtectedRoute>
            } />
            <Route path="/historico" element={
              <ProtectedRoute><Historico /></ProtectedRoute>
            } />
            <Route path="/certificado" element={
              <ProtectedRoute><Certificado /></ProtectedRoute>
            } />
            <Route path="/perfil" element={
              <ProtectedRoute><Perfil /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute><AdminPanel /></ProtectedRoute>
            } />
            <Route path="/forbidden" element={<Forbidden />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
