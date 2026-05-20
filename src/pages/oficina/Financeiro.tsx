import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth";
import {
  getContasReceber,
  getContasPagar,
  getCaixaDiario,
  getClientes,
  getFornecedores,
  createContaReceber,
  updateContaReceber,
  createContaPagar,
  updateContaPagar,
  createCaixaDiario,
} from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import { FORMAS_PAGAMENTO, type FormaPagamento } from "@/lib/types";

export default function Financeiro() {
  const { user } = useAuth();
  const oficinaId = user?.oficinaId ?? "";

  const [contasReceber, setContasReceber] = useState(() =>
    getContasReceber(oficinaId),
  );
  const [contasPagar, setContasPagar] = useState(() =>
    getContasPagar(oficinaId),
  );
  const hoje = new Date().toISOString().split("T")[0];
  const [caixaData, setCaixaData] = useState(hoje);
  const [caixa, setCaixa] = useState(() =>
    getCaixaDiario(oficinaId, hoje),
  );
  const clientes = getClientes(oficinaId);
  const fornecedores = getFornecedores(oficinaId);

  const refreshCR = useCallback(
    () => setContasReceber(getContasReceber(oficinaId)),
    [oficinaId],
  );
  const refreshCP = useCallback(
    () => setContasPagar(getContasPagar(oficinaId)),
    [oficinaId],
  );
  const refreshCaixa = useCallback(
    () => setCaixa(getCaixaDiario(oficinaId, caixaData)),
    [oficinaId, caixaData],
  );

  // Conta a Receber form
  const [crOpen, setCrOpen] = useState(false);
  const [crForm, setCrForm] = useState({
    clienteId: "",
    descricao: "",
    valor: "",
    dataVencimento: "",
  });

  // Conta a Pagar form
  const [cpOpen, setCpOpen] = useState(false);
  const [cpForm, setCpForm] = useState({
    fornecedorId: "",
    descricao: "",
    valor: "",
    dataVencimento: "",
  });

  // Caixa form
  const [cxOpen, setCxOpen] = useState(false);
  const [cxForm, setCxForm] = useState({
    tipo: "entrada" as "entrada" | "saida",
    descricao: "",
    valor: "",
    formaPagamento: "dinheiro" as FormaPagamento,
  });

  function handleCR(e: React.FormEvent) {
    e.preventDefault();
    createContaReceber({
      oficinaId,
      clienteId: crForm.clienteId,
      descricao: crForm.descricao,
      valor: parseFloat(crForm.valor),
      dataVencimento: crForm.dataVencimento,
      pago: false,
    });
    refreshCR();
    setCrOpen(false);
    setCrForm({ clienteId: "", descricao: "", valor: "", dataVencimento: "" });
  }

  function handleCP(e: React.FormEvent) {
    e.preventDefault();
    createContaPagar({
      oficinaId,
      fornecedorId: cpForm.fornecedorId || undefined,
      descricao: cpForm.descricao,
      valor: parseFloat(cpForm.valor),
      dataVencimento: cpForm.dataVencimento,
      pago: false,
    });
    refreshCP();
    setCpOpen(false);
    setCpForm({
      fornecedorId: "",
      descricao: "",
      valor: "",
      dataVencimento: "",
    });
  }

  function handleCX(e: React.FormEvent) {
    e.preventDefault();
    createCaixaDiario({
      oficinaId,
      tipo: cxForm.tipo,
      descricao: cxForm.descricao,
      valor: parseFloat(cxForm.valor),
      formaPagamento: cxForm.formaPagamento,
      data: caixaData,
    });
    refreshCaixa();
    setCxOpen(false);
    setCxForm({
      tipo: "entrada",
      descricao: "",
      valor: "",
      formaPagamento: "dinheiro",
    });
  }

  const clienteMap = Object.fromEntries(
    clientes.map((c) => [c.id, c.nome]),
  );
  const fornecedorMap = Object.fromEntries(
    fornecedores.map((f) => [f.id, f.nome]),
  );

  const totalEntradas = caixa
    .filter((c) => c.tipo === "entrada")
    .reduce((s, c) => s + c.valor, 0);
  const totalSaidas = caixa
    .filter((c) => c.tipo === "saida")
    .reduce((s, c) => s + c.valor, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Financeiro</h1>

      <Tabs defaultValue="receber">
        <TabsList>
          <TabsTrigger value="receber">Contas a Receber</TabsTrigger>
          <TabsTrigger value="pagar">Contas a Pagar</TabsTrigger>
          <TabsTrigger value="caixa">Caixa Diário</TabsTrigger>
        </TabsList>

        {/* Contas a Receber */}
        <TabsContent value="receber">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Contas a Receber</CardTitle>
              <Dialog open={crOpen} onOpenChange={setCrOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Conta a Receber</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCR} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Cliente</Label>
                      <Select
                        value={crForm.clienteId}
                        onValueChange={(v) =>
                          setCrForm({ ...crForm, clienteId: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {clientes.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Input
                        value={crForm.descricao}
                        onChange={(e) =>
                          setCrForm({ ...crForm, descricao: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Valor</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={crForm.valor}
                          onChange={(e) =>
                            setCrForm({ ...crForm, valor: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Vencimento</Label>
                        <Input
                          type="date"
                          value={crForm.dataVencimento}
                          onChange={(e) =>
                            setCrForm({
                              ...crForm,
                              dataVencimento: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      Cadastrar
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {contasReceber.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">
                  Nenhuma conta a receber
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Pago</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contasReceber.map((cr) => (
                      <TableRow key={cr.id}>
                        <TableCell>
                          {clienteMap[cr.clienteId] ?? "—"}
                        </TableCell>
                        <TableCell>{cr.descricao}</TableCell>
                        <TableCell>
                          {formatDate(cr.dataVencimento)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(cr.valor)}
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={cr.pago}
                            onCheckedChange={(checked) => {
                              updateContaReceber(cr.id, {
                                pago: checked === true,
                              });
                              refreshCR();
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contas a Pagar */}
        <TabsContent value="pagar">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Contas a Pagar</CardTitle>
              <Dialog open={cpOpen} onOpenChange={setCpOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Conta a Pagar</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCP} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Fornecedor (opcional)</Label>
                      <Select
                        value={cpForm.fornecedorId}
                        onValueChange={(v) =>
                          setCpForm({ ...cpForm, fornecedorId: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {fornecedores.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Input
                        value={cpForm.descricao}
                        onChange={(e) =>
                          setCpForm({ ...cpForm, descricao: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Valor</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={cpForm.valor}
                          onChange={(e) =>
                            setCpForm({ ...cpForm, valor: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Vencimento</Label>
                        <Input
                          type="date"
                          value={cpForm.dataVencimento}
                          onChange={(e) =>
                            setCpForm({
                              ...cpForm,
                              dataVencimento: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      Cadastrar
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {contasPagar.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">
                  Nenhuma conta a pagar
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Pago</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contasPagar.map((cp) => (
                      <TableRow key={cp.id}>
                        <TableCell>
                          {cp.fornecedorId
                            ? (fornecedorMap[cp.fornecedorId] ?? "—")
                            : "—"}
                        </TableCell>
                        <TableCell>{cp.descricao}</TableCell>
                        <TableCell>
                          {formatDate(cp.dataVencimento)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(cp.valor)}
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={cp.pago}
                            onCheckedChange={(checked) => {
                              updateContaPagar(cp.id, {
                                pago: checked === true,
                              });
                              refreshCP();
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Caixa Diário */}
        <TabsContent value="caixa">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Caixa Diário</CardTitle>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span className="text-green-600">
                    Entradas: {formatCurrency(totalEntradas)}
                  </span>
                  <span className="text-red-600">
                    Saídas: {formatCurrency(totalSaidas)}
                  </span>
                  <span className="font-bold">
                    Saldo: {formatCurrency(totalEntradas - totalSaidas)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={caixaData}
                  onChange={(e) => {
                    setCaixaData(e.target.value);
                    setCaixa(getCaixaDiario(oficinaId, e.target.value));
                  }}
                  className="w-40"
                />
                <Dialog open={cxOpen} onOpenChange={setCxOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Novo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Lançamento</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCX} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select
                          value={cxForm.tipo}
                          onValueChange={(v) =>
                            setCxForm({
                              ...cxForm,
                              tipo: v as "entrada" | "saida",
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="entrada">Entrada</SelectItem>
                            <SelectItem value="saida">Saída</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Input
                          value={cxForm.descricao}
                          onChange={(e) =>
                            setCxForm({
                              ...cxForm,
                              descricao: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Valor</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={cxForm.valor}
                          onChange={(e) =>
                            setCxForm({ ...cxForm, valor: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Forma de Pagamento</Label>
                        <Select
                          value={cxForm.formaPagamento}
                          onValueChange={(v) =>
                            setCxForm({
                              ...cxForm,
                              formaPagamento: v as FormaPagamento,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(FORMAS_PAGAMENTO).map(
                              ([k, v]) => (
                                <SelectItem key={k} value={k}>
                                  {v}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full">
                        Lançar
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {caixa.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">
                  Nenhum lançamento nesta data
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {caixa.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <Badge
                            variant={
                              c.tipo === "entrada"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {c.tipo === "entrada" ? "Entrada" : "Saída"}
                          </Badge>
                        </TableCell>
                        <TableCell>{c.descricao}</TableCell>
                        <TableCell>
                          {FORMAS_PAGAMENTO[c.formaPagamento]}
                        </TableCell>
                        <TableCell
                          className={`text-right ${c.tipo === "entrada" ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatCurrency(c.valor)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
