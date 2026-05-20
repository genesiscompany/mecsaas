import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  BarChart3,
  LogOut,
  Repeat,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { href: "/super-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/super-admin/oficinas", label: "Oficinas", icon: Building2 },
  { href: "/super-admin/planos", label: "Planos", icon: CreditCard },
  { href: "/super-admin/assinaturas", label: "Assinaturas", icon: Repeat },
  { href: "/super-admin/relatorios", label: "Relatórios", icon: BarChart3 },
];

export default function SuperAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="px-4 py-4">
          <img
            src="/logo.png"
            alt="macSaas.com.br"
            className="h-10 object-contain"
          />
          <div className="mt-1 flex items-center gap-1 px-1 text-xs text-gray-400">
            <ShieldCheck className="h-3 w-3" />
            Super Admin
          </div>
        </div>
        <ScrollArea className="flex-1 px-3">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                      active
                        ? "bg-blue-600 font-medium text-white shadow-lg shadow-blue-600/30"
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
        <div className="border-t border-gray-700 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {user?.name?.charAt(0) ?? "A"}
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
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
