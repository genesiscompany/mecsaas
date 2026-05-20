import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getAllReceitas,
  getAllClientes,
  getAllVeiculos,
  getAllFornecedores,
  getOficinas,
} from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export default function SuperAdminRelatorios() {
  const oficinas = getOficinas();
  const [filtroOficina, setFiltroOficina] = useState("todas");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const receitas = useMemo(() => {
    let items = getAllReceitas();
    if (filtroOficina !== "todas")
      items = items.filter((r) => r.oficinaId === filtroOficina);
    if (dataInicio) items = items.filter((r) => r.data >= dataInicio);
    if (dataFim) items = items.filter((r) => r.data <= dataFim);
    return items;
  }, [filtroOficina, dataInicio, dataFim]);

  const receitasPorOficina = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of receitas) {
      map.set(r.oficinaId, (map.get(r.oficinaId) ?? 0) + r.valor);
    }
    return oficinas.map((o) => ({
      nome: o.nome,
      total: map.get(o.id) ?? 0,
    }));
  }, [receitas, oficinas]);

  const cadastros = useMemo(() => {
    const clientes = getAllClientes();
    const veiculos = getAllVeiculos();
    const fornecedores = getAllFornecedores();
    return oficinas.map((o) => ({
      nome: o.nome,
      clientes: clientes.filter((c) => c.oficinaId === o.id).length,
      veiculos: veiculos.filter((v) => v.oficinaId === o.id).length,
      fornecedores: fornecedores.filter((f) => f.oficinaId === o.id).length,
    }));
  }, [oficinas]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Relatórios</h1>

      <div className="flex flex-wrap gap-4">
        <div className="space-y-2">
          <Label>Oficina</Label>
          <Select value={filtroOficina} onValueChange={setFiltroOficina}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {oficinas.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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

      <Tabs defaultValue="receitas">
        <TabsList>
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="cadastros">Cadastros</TabsTrigger>
        </TabsList>

        <TabsContent value="receitas">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Oficina</TableHead>
                    <TableHead className="text-right">
                      Total de Receitas
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receitasPorOficina.map((r) => (
                    <TableRow key={r.nome}>
                      <TableCell className="font-medium">{r.nome}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(r.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell>Total Geral</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(
                        receitasPorOficina.reduce(
                          (sum, r) => sum + r.total,
                          0,
                        ),
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cadastros">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Cadastros</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Oficina</TableHead>
                    <TableHead className="text-right">Clientes</TableHead>
                    <TableHead className="text-right">Veículos</TableHead>
                    <TableHead className="text-right">
                      Fornecedores
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cadastros.map((c) => (
                    <TableRow key={c.nome}>
                      <TableCell className="font-medium">{c.nome}</TableCell>
                      <TableCell className="text-right">
                        {c.clientes}
                      </TableCell>
                      <TableCell className="text-right">
                        {c.veiculos}
                      </TableCell>
                      <TableCell className="text-right">
                        {c.fornecedores}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
