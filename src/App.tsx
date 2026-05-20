import { useState, useEffect, type ReactNode } from "react";
import { Route, Switch, Redirect, useLocation } from "wouter";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import { loadAllData } from "@/lib/store";

import LandingPage from "@/pages/landing/LandingPage";
import LoginOficina from "@/pages/auth/LoginOficina";
import LoginSuperAdmin from "@/pages/auth/LoginSuperAdmin";

import SuperAdminLayout from "@/components/SuperAdminLayout";
import SuperAdminDashboard from "@/pages/super-admin/Dashboard";
import Oficinas from "@/pages/super-admin/Oficinas";
import Planos from "@/pages/super-admin/Planos";
import SuperAdminRelatorios from "@/pages/super-admin/Relatorios";
import Assinaturas from "@/pages/super-admin/Assinaturas";

import OficinaLayout from "@/components/OficinaLayout";
import OficinaDashboard from "@/pages/oficina/Dashboard";
import Receitas from "@/pages/oficina/Receitas";
import Despesas from "@/pages/oficina/Despesas";
import Estoque from "@/pages/oficina/Estoque";
import OrdensServico from "@/pages/oficina/OrdensServico";
import Clientes from "@/pages/oficina/Clientes";
import Veiculos from "@/pages/oficina/Veiculos";
import Fornecedores from "@/pages/oficina/Fornecedores";
import Financeiro from "@/pages/oficina/Financeiro";
import OficinaRelatorios from "@/pages/oficina/Relatorios";

function RequireSuperAdmin({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  if (!user || user.role !== "super_admin") {
    navigate("/super-admin/login");
    return null;
  }
  return <SuperAdminLayout>{children}</SuperAdminLayout>;
}

function RequireOficinaAdmin({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  if (!user || user.role !== "oficina_admin") {
    navigate("/login");
    return null;
  }
  return <OficinaLayout>{children}</OficinaLayout>;
}

function AppRoutes() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginOficina} />
      <Route path="/super-admin/login" component={LoginSuperAdmin} />

      {/* Super Admin */}
      <Route path="/super-admin/dashboard">
        <RequireSuperAdmin>
          <SuperAdminDashboard />
        </RequireSuperAdmin>
      </Route>
      <Route path="/super-admin/oficinas">
        <RequireSuperAdmin>
          <Oficinas />
        </RequireSuperAdmin>
      </Route>
      <Route path="/super-admin/planos">
        <RequireSuperAdmin>
          <Planos />
        </RequireSuperAdmin>
      </Route>
      <Route path="/super-admin/assinaturas">
        <RequireSuperAdmin>
          <Assinaturas />
        </RequireSuperAdmin>
      </Route>
      <Route path="/super-admin/relatorios">
        <RequireSuperAdmin>
          <SuperAdminRelatorios />
        </RequireSuperAdmin>
      </Route>

      {/* Oficina Admin */}
      <Route path="/oficina/dashboard">
        <RequireOficinaAdmin>
          <OficinaDashboard />
        </RequireOficinaAdmin>
      </Route>
      <Route path="/oficina/receitas">
        <RequireOficinaAdmin>
          <Receitas />
        </RequireOficinaAdmin>
      </Route>
      <Route path="/oficina/despesas">
        <RequireOficinaAdmin>
          <Despesas />
        </RequireOficinaAdmin>
      </Route>
      <Route path="/oficina/estoque">
        <RequireOficinaAdmin>
          <Estoque />
        </RequireOficinaAdmin>
      </Route>
      <Route path="/oficina/ordens-servico">
        <RequireOficinaAdmin>
          <OrdensServico />
        </RequireOficinaAdmin>
      </Route>
      <Route path="/oficina/clientes">
        <RequireOficinaAdmin>
          <Clientes />
        </RequireOficinaAdmin>
      </Route>
      <Route path="/oficina/veiculos">
        <RequireOficinaAdmin>
          <Veiculos />
        </RequireOficinaAdmin>
      </Route>
      <Route path="/oficina/fornecedores">
        <RequireOficinaAdmin>
          <Fornecedores />
        </RequireOficinaAdmin>
      </Route>
      <Route path="/oficina/financeiro">
        <RequireOficinaAdmin>
          <Financeiro />
        </RequireOficinaAdmin>
      </Route>
      <Route path="/oficina/relatorios">
        <RequireOficinaAdmin>
          <OficinaRelatorios />
        </RequireOficinaAdmin>
      </Route>

      {/* Fallback */}
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadAllData().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-lg font-medium text-gray-700">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster />
    </AuthProvider>
  );
}
