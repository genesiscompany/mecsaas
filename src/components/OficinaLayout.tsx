import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Package,
  FileText,
  Users,
  Car,
  Truck,
  Wallet,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  {
    href: "/oficina/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  { href: "/oficina/receitas", label: "Receitas", icon: TrendingUp },
  { href: "/oficina/despesas", label: "Despesas", icon: TrendingDown },
  { href: "/oficina/estoque", label: "Estoque e Serviços", icon: Package },
  {
    href: "/oficina/ordens-servico",
    label: "Ordens de Serviço",
    icon: FileText,
  },
  { href: "/oficina/clientes", label: "Clientes", icon: Users },
  { href: "/oficina/veiculos", label: "Veículos", icon: Car },
  { href: "/oficina/fornecedores", label: "Fornecedores", icon: Truck },
  { href: "/oficina/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/oficina/relatorios", label: "Relatórios", icon: BarChart3 },
];

export default function OficinaLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentPage = navItems.find((item) => item.href === location);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gradient-to-b from-slate-900 to-slate-800 transition-transform duration-200 md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <img
              src="/logo.png"
              alt="macSaas.com.br"
              className="h-10 object-contain"
            />
            <div className="mt-1 px-1 text-xs text-gray-400">Painel da Oficina</div>
          </div>
          <button
            className="rounded p-1 text-gray-400 hover:text-white md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <ScrollArea className="flex-1 px-3">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                      active
                        ? "bg-emerald-600 font-medium text-white shadow-lg shadow-emerald-600/30"
                        : "text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
        <div className="border-t border-slate-700 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
              {user?.name?.charAt(0) ?? "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {user?.name}
              </p>
              <p className="truncate text-xs text-gray-400">
                {user?.email}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-gray-400 hover:bg-white/10 hover:text-white"
            onClick={() => {
              logout();
              window.location.href = "/";
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b bg-white px-4 py-3 md:hidden">
          <button
            className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-gray-800">
            {currentPage?.label ?? "macSaas"}
          </span>
        </div>
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
