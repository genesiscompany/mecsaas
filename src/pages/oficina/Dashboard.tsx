import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import {
  getOficinaDashboardStats,
  getOrdensServico,
  getReceitas,
  getDespesas,
  getEstoque,
  getClientes,
} from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  FileText,
  Users,
  Package,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { OS_STATUS_LABELS, RECEITA_CATEGORIAS, type ReceitaCategoria } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function OficinaDashboard() {
  const { user } = useAuth();
  const oficinaId = user?.oficinaId ?? "";
  const [stats] = useState(() => getOficinaDashboardStats(oficinaId));
  const receitas = getReceitas(oficinaId);
  const despesas = getDespesas(oficinaId);
  const estoque = getEstoque(oficinaId);
  const clientes = getClientes(oficinaId);
  const osRecentes = getOrdensServico(oficinaId).slice(-5).reverse();

  const estoqueBaixo = estoque.filter((i) => i.quantidade <= i.estoqueMinimo);

  const receitasPorCategoria = useMemo(() => {
    const map = new Map<ReceitaCategoria, number>();
    for (const r of receitas) {
      map.set(r.categoria, (map.get(r.categoria) ?? 0) + r.valor);
    }
    return Array.from(map.entries()).map(([cat, total]) => ({
      name: RECEITA_CATEGORIAS[cat],
      value: total,
    }));
  }, [receitas]);

  // Monthly data
  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthStr = date.toLocaleDateString("pt-BR", { month: "short" });
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const rec = receitas
        .filter((r) => r.data.startsWith(yearMonth))
        .reduce((s, r) => s + r.valor, 0);
      const desp = despesas
        .filter((d) => d.data.startsWith(yearMonth))
        .reduce((s, d) => s + d.valor, 0);
      return { mes: monthStr, receitas: rec, despesas: desp };
    });
  }, [receitas, despesas]);

  const statCards = [
    {
      title: "Receitas do Mês",
      value: formatCurrency(stats.receitasMes),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Despesas do Mês",
      value: formatCurrency(stats.despesasMes),
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Saldo",
      value: formatCurrency(stats.saldo),
      icon: Wallet,
      color: stats.saldo >= 0 ? "text-green-600" : "text-red-600",
      bgColor: stats.saldo >= 0 ? "bg-green-50" : "bg-red-50",
    },
    {
      title: "OS em Andamento",
      value: String(stats.osEmAndamento),
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total de Clientes",
      value: String(clientes.length),
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Itens no Estoque",
      value: String(estoque.length),
      icon: Package,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral da sua oficina
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <Card key={card.title} className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bgColor}`}
              >
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Low stock alert */}
      {estoqueBaixo.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {estoqueBaixo.map((item) => (
                <Badge
                  key={item.id}
                  variant="outline"
                  className="border-amber-300 bg-white text-amber-700"
                >
                  {item.nome}: {item.quantidade} unidades
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Receitas vs Despesas (6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.some((m) => m.receitas > 0 || m.despesas > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar
                    dataKey="receitas"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                    name="Receitas"
                  />
                  <Bar
                    dataKey="despesas"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    name="Despesas"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[280px] items-center justify-center text-muted-foreground">
                Dados aparecerão aqui conforme você registrar receitas e
                despesas
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-600" />
              Receitas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {receitasPorCategoria.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={receitasPorCategoria}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    label={({ name, value }) =>
                      `${name}: ${formatCurrency(value)}`
                    }
                    labelLine={false}
                  >
                    {receitasPorCategoria.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[280px] items-center justify-center text-muted-foreground">
                Nenhuma receita registrada
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent OS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Ordens de Serviço Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {osRecentes.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Nenhuma ordem de serviço criada
            </p>
          ) : (
            <div className="space-y-3">
              {osRecentes.map((os) => (
                <div
                  key={os.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-semibold">OS #{os.numero}</span>
                      <p className="text-sm text-muted-foreground">
                        {os.descricaoServico}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">
                      {formatCurrency(os.valor)}
                    </span>
                    <Badge
                      variant={
                        os.status === "concluida"
                          ? "default"
                          : os.status === "cancelada"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {OS_STATUS_LABELS[os.status]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
