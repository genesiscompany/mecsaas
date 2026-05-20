import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import { getReceitas, getDespesas, getOrdensServico } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import {
  RECEITA_CATEGORIAS,
  DESPESA_CATEGORIAS,
  type ReceitaCategoria,
  type DespesaCategoria,
} from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function OficinaRelatorios() {
  const { user } = useAuth();
  const oficinaId = user?.oficinaId ?? "";
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const receitas = useMemo(() => {
    let items = getReceitas(oficinaId);
    if (dataInicio) items = items.filter((r) => r.data >= dataInicio);
    if (dataFim) items = items.filter((r) => r.data <= dataFim);
    return items;
  }, [oficinaId, dataInicio, dataFim]);

  const despesas = useMemo(() => {
    let items = getDespesas(oficinaId);
    if (dataInicio) items = items.filter((d) => d.data >= dataInicio);
    if (dataFim) items = items.filter((d) => d.data <= dataFim);
    return items;
  }, [oficinaId, dataInicio, dataFim]);

  const ordens = useMemo(() => {
    let items = getOrdensServico(oficinaId);
    if (dataInicio)
      items = items.filter(
        (os) => os.criadoEm.split("T")[0] >= dataInicio,
      );
    if (dataFim)
      items = items.filter(
        (os) => os.criadoEm.split("T")[0] <= dataFim,
      );
    return items;
  }, [oficinaId, dataInicio, dataFim]);

  const totalReceitas = receitas.reduce((s, r) => s + r.valor, 0);
  const totalDespesas = despesas.reduce((s, d) => s + d.valor, 0);
  const lucro = totalReceitas - totalDespesas;

  const despesasPorCategoria = useMemo(() => {
    const map = new Map<DespesaCategoria, number>();
    for (const d of despesas) {
      map.set(d.categoria, (map.get(d.categoria) ?? 0) + d.valor);
    }
    return Array.from(map.entries()).map(([cat, total]) => ({
      categoria: DESPESA_CATEGORIAS[cat],
      total,
    }));
  }, [despesas]);

  const receitasPorCategoria = useMemo(() => {
    const map = new Map<ReceitaCategoria, number>();
    for (const r of receitas) {
      map.set(r.categoria, (map.get(r.categoria) ?? 0) + r.valor);
    }
    return Array.from(map.entries()).map(([cat, total]) => ({
      categoria: RECEITA_CATEGORIAS[cat],
      total,
    }));
  }, [receitas]);

  const osConcluidasCount = ordens.filter(
    (os) => os.status === "concluida",
  ).length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Relatórios</h1>

      <div className="flex flex-wrap gap-4">
        <div className="space-y-2">
          <Label>Data Início</Label>
          <Input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-2">
          <Label>Data Fim</Label>
          <Input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalReceitas)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalDespesas)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lucro</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${lucro >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatCurrency(lucro)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="faturamento">
        <TabsList>
          <TabsTrigger value="faturamento">Faturamento</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
        </TabsList>

        <TabsContent value="faturamento">
          <Card>
            <CardHeader>
              <CardTitle>Faturamento por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {receitasPorCategoria.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={receitasPorCategoria}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="categoria" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar
                      dataKey="total"
                      fill="#22c55e"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-8 text-center text-muted-foreground">
                  Sem dados para o período
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="despesas">
          <Card>
            <CardHeader>
              <CardTitle>Despesas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {despesasPorCategoria.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={despesasPorCategoria}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="categoria" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Bar
                        dataKey="total"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  <Table className="mt-4">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {despesasPorCategoria.map((d) => (
                        <TableRow key={d.categoria}>
                          <TableCell>{d.categoria}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(d.total)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <p className="py-8 text-center text-muted-foreground">
                  Sem dados para o período
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="servicos">
          <Card>
            <CardHeader>
              <CardTitle>Serviços Realizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid grid-cols-3 gap-4">
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-2xl font-bold">{ordens.length}</div>
                  <div className="text-sm text-muted-foreground">
                    Total de OS
                  </div>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {osConcluidasCount}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Concluídas
                  </div>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-2xl font-bold">
                    {formatCurrency(
                      ordens
                        .filter((os) => os.status === "concluida")
                        .reduce((s, os) => s + os.valor, 0),
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Valor Total
                  </div>
                </div>
              </div>
              {ordens.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>OS</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordens.map((os) => (
                      <TableRow key={os.id}>
                        <TableCell>#{os.numero}</TableCell>
                        <TableCell>{os.descricaoServico}</TableCell>
                        <TableCell className="capitalize">
                          {os.status.replace("_", " ")}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(os.valor)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="py-4 text-center text-muted-foreground">
                  Sem ordens para o período
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
