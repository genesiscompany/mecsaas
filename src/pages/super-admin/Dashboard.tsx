import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getSuperAdminStats,
  getAllReceitas,
  getOficinas,
  getAllDespesas,
  getAllOrdensServico,
} from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import {
  Building2,
  DollarSign,
  Users,
  Car,
  TrendingUp,
  FileText,
  Truck,
} from "lucide-react";
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
  AreaChart,
  Area,
} from "recharts";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function SuperAdminDashboard() {
  const [stats] = useState(() => getSuperAdminStats());
  const [receitas] = useState(() => getAllReceitas());
  const [despesas] = useState(() => getAllDespesas());
  const [oficinas] = useState(() => getOficinas());
  const [ordens] = useState(() => getAllOrdensServico());

  const totalDespesas = despesas.reduce((s, d) => s + d.valor, 0);
  const totalOS = ordens.length;

  const receitasPorOficina = oficinas
    .filter((o) => o.ativa)
    .map((o) => ({
      nome: o.nome.length > 15 ? o.nome.slice(0, 15) + "…" : o.nome,
      receitas: receitas
        .filter((r) => r.oficinaId === o.id)
        .reduce((sum, r) => sum + r.valor, 0),
      despesas: despesas
        .filter((d) => d.oficinaId === o.id)
        .reduce((sum, d) => sum + d.valor, 0),
    }));

  // Monthly revenue for area chart (last 6 months)
  const now = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
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

  const statCards = [
    {
      title: "Total de Oficinas",
      value: String(stats.totalOficinas),
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Receitas Totais",
      value: formatCurrency(stats.totalReceitas),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Despesas Totais",
      value: formatCurrency(totalDespesas),
      icon: DollarSign,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Total de OS",
      value: String(totalOS),
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total de Clientes",
      value: String(stats.totalClientes),
      icon: Users,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
    },
    {
      title: "Total de Veículos",
      value: String(stats.totalVeiculos),
      icon: Car,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Total de Fornecedores",
      value: String(stats.totalFornecedores),
      icon: Truck,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Lucro Total",
      value: formatCurrency(stats.totalReceitas - totalDespesas),
      icon: DollarSign,
      color:
        stats.totalReceitas - totalDespesas >= 0
          ? "text-green-600"
          : "text-red-600",
      bgColor:
        stats.totalReceitas - totalDespesas >= 0
          ? "bg-green-50"
          : "bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral da plataforma
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card
            key={card.title}
            className="transition-all hover:shadow-md"
          >
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

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Evolução Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.some((m) => m.receitas > 0 || m.despesas > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient
                      id="colorReceitas"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#22c55e"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#22c55e"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorDespesas"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#ef4444"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#ef4444"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="receitas"
                    stroke="#22c55e"
                    fill="url(#colorReceitas)"
                    strokeWidth={2}
                    name="Receitas"
                  />
                  <Area
                    type="monotone"
                    dataKey="despesas"
                    stroke="#ef4444"
                    fill="url(#colorDespesas)"
                    strokeWidth={2}
                    name="Despesas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Dados aparecerão aqui conforme oficinas registrem receitas e
                despesas
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              Distribuição por Plano
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.planoDistribuicao.some((p) => p.count > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.planoDistribuicao.filter((p) => p.count > 0)}
                    dataKey="count"
                    nameKey="nome"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    label={({ nome, count }) => `${nome}: ${count}`}
                  >
                    {stats.planoDistribuicao.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Nenhuma oficina cadastrada
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Receitas vs Despesas por Oficina
          </CardTitle>
        </CardHeader>
        <CardContent>
          {receitasPorOficina.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={receitasPorOficina}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="nome" />
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
            <div className="flex h-[350px] items-center justify-center text-muted-foreground">
              Nenhuma oficina cadastrada ainda
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
