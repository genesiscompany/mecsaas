import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import {
  getOrdensServico,
  getClientes,
  getVeiculos,
  getEstoque,
  getOficina,
  createOrdemServico,
  updateOrdemServico,
  concluirOrdemServico,
} from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, CheckCircle2, XCircle, Play, MessageCircle, Printer } from "lucide-react";
import {
  OS_STATUS_LABELS,
  type OrdemServico,
  type OSStatus,
} from "@/lib/types";
import { toast } from "sonner";

export default function OrdensServico() {
  const { user } = useAuth();
  const oficinaId = user?.oficinaId ?? "";
  const [ordens, setOrdens] = useState(() => getOrdensServico(oficinaId));
  const [dialogOpen, setDialogOpen] = useState(false);
  const clientes = getClientes(oficinaId);
  const veiculos = getVeiculos(oficinaId);
  const estoque = getEstoque(oficinaId);

  const [form, setForm] = useState({
    clienteId: "",
    veiculoId: "",
    descricaoServico: "",
    valor: "",
    pecasUsadas: [] as { itemEstoqueId: string; quantidade: number }[],
  });
  const [pecaId, setPecaId] = useState("");
  const [pecaQtd, setPecaQtd] = useState("1");

  const refresh = useCallback(
    () => setOrdens(getOrdensServico(oficinaId)),
    [oficinaId],
  );

  function resetForm() {
    setForm({
      clienteId: "",
      veiculoId: "",
      descricaoServico: "",
      valor: "",
      pecasUsadas: [],
    });
    setPecaId("");
    setPecaQtd("1");
  }

  function addPeca() {
    if (!pecaId) return;
    const item = estoque.find((e) => e.id === pecaId);
    if (!item) return;
    if (item.quantidade < parseInt(pecaQtd)) {
      toast.error(`Estoque insuficiente para "${item.nome}"`);
      return;
    }
    setForm({
      ...form,
      pecasUsadas: [
        ...form.pecasUsadas,
        { itemEstoqueId: pecaId, quantidade: parseInt(pecaQtd) },
      ],
    });
    setPecaId("");
    setPecaQtd("1");
  }

  function removePeca(idx: number) {
    setForm({
      ...form,
      pecasUsadas: form.pecasUsadas.filter((_, i) => i !== idx),
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createOrdemServico({
      oficinaId,
      clienteId: form.clienteId,
      veiculoId: form.veiculoId,
      descricaoServico: form.descricaoServico,
      valor: parseFloat(form.valor),
      pecasUsadas: form.pecasUsadas,
      status: "aberta",
    });
    refresh();
    setDialogOpen(false);
    resetForm();
  }

  function handleStatusChange(os: OrdemServico, status: OSStatus) {
    if (status === "concluida") {
      concluirOrdemServico(os.id);
      toast.success(`OS #${os.numero} concluída — receita e estoque atualizados`);
    } else {
      updateOrdemServico(os.id, { status });
    }
    refresh();
  }

  const clienteMap = Object.fromEntries(
    clientes.map((c) => [c.id, c]),
  );
  const veiculoMap = Object.fromEntries(
    veiculos.map((v) => [v.id, `${v.marca} ${v.modelo} - ${v.placa}`]),
  );

  function imprimirTermica(os: OrdemServico) {
    const oficina = getOficina(oficinaId);
    const cliente = clienteMap[os.clienteId];
    const veiculo = veiculoMap[os.veiculoId] ?? "—";
    const statusLabel = OS_STATUS_LABELS[os.status];
    const nomeCliente = cliente?.nome ?? "—";
    const telCliente = cliente?.telefone ?? "—";

    const nomeOficina = oficina?.nome ?? "Oficina";
    const cnpjOficina = oficina?.cnpj ?? "";
    const telOficina = oficina?.telefone ?? "";
    const endOficina = oficina?.endereco ?? "";

    const pecasHtml = os.pecasUsadas.length > 0
      ? os.pecasUsadas.map((p) => {
          const item = estoque.find((e) => e.id === p.itemEstoqueId);
          return `<tr><td>${item?.nome ?? "Peça"}</td><td style="text-align:right">${p.quantidade}</td></tr>`;
        }).join("")
      : "<tr><td colspan='2' style='text-align:center'>Nenhuma peça</td></tr>";

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>OS #${os.numero}</title>
  <style>
    @page { margin: 0; size: 80mm auto; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      width: 80mm;
      padding: 4mm;
      color: #000;
    }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .divider {
      border-top: 1px dashed #000;
      margin: 6px 0;
    }
    .header { font-size: 16px; font-weight: bold; margin-bottom: 2px; }
    .sub { font-size: 10px; color: #555; margin-bottom: 2px; }
    .row { display: flex; justify-content: space-between; margin: 2px 0; }
    .row .label { font-weight: bold; }
    .total { font-size: 16px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 4px 0; }
    table td { padding: 2px 0; font-size: 11px; }
    .footer { font-size: 10px; text-align: center; margin-top: 8px; color: #555; }
  </style>
</head>
<body>
  <div class="center">
    <div class="header">${nomeOficina}</div>
    ${cnpjOficina ? `<div class="sub">CNPJ: ${cnpjOficina}</div>` : ""}
    ${telOficina ? `<div class="sub">Tel: ${telOficina}</div>` : ""}
    ${endOficina ? `<div class="sub">${endOficina}</div>` : ""}
  </div>
  <div class="divider"></div>
  <div class="center bold" style="font-size:14px;margin:4px 0">
    ORDEM DE SERVIÇO #${os.numero}
  </div>
  <div class="divider"></div>
  <div class="row"><span class="label">Cliente:</span><span>${nomeCliente}</span></div>
  <div class="row"><span class="label">Telefone:</span><span>${telCliente}</span></div>
  <div class="row"><span class="label">Veículo:</span><span>${veiculo}</span></div>
  <div class="divider"></div>
  <div class="bold">Serviço:</div>
  <div style="margin:2px 0 4px">${os.descricaoServico}</div>
  <div class="divider"></div>
  <div class="bold" style="margin-bottom:2px">Peças Utilizadas:</div>
  <table>${pecasHtml}</table>
  <div class="divider"></div>
  <div class="row"><span class="label">Status:</span><span>${statusLabel}</span></div>
  <div class="row"><span class="label">Data:</span><span>${formatDate(os.criadoEm)}</span></div>
  <div class="divider"></div>
  <div class="row total"><span>TOTAL:</span><span>${formatCurrency(os.valor)}</span></div>
  <div class="divider"></div>
  <div class="footer">
    Obrigado pela preferência!<br/>
    ${nomeOficina}
  </div>
</body>
</html>`;

    const win = window.open("", "_blank", "width=320,height=600");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => { win.print(); }, 400);
    }
  }

  function compartilharWhatsApp(os: OrdemServico) {
    const cliente = clienteMap[os.clienteId];
    if (!cliente) {
      toast.error("Cliente não encontrado");
      return;
    }
    const telefone = cliente.telefone.replace(/\D/g, "");
    if (!telefone) {
      toast.error("Cliente não possui telefone cadastrado");
      return;
    }
    const tel = telefone.startsWith("55") ? telefone : `55${telefone}`;
    const veiculo = veiculoMap[os.veiculoId] ?? "";
    const statusLabel = OS_STATUS_LABELS[os.status];
    const msg = [
      `*macSaas - Ordem de Serviço #${os.numero}*`,
      ``,
      `Olá ${cliente.nome}! Segue os detalhes da sua OS:`,
      ``,
      `*Veículo:* ${veiculo}`,
      `*Serviço:* ${os.descricaoServico}`,
      `*Valor:* ${formatCurrency(os.valor)}`,
      `*Status:* ${statusLabel}`,
      `*Data:* ${formatDate(os.criadoEm)}`,
      ``,
      `Qualquer dúvida estamos à disposição!`,
    ].join("%0a");
    window.open(`https://wa.me/${tel}?text=${msg}`, "_blank");
  }

  const veiculosFiltrados = form.clienteId
    ? veiculos.filter((v) => v.clienteId === form.clienteId)
    : veiculos;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ordens de Serviço</h1>
        <Dialog
          open={dialogOpen}
          onOpenChange={(o) => {
            setDialogOpen(o);
            if (!o) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova OS
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nova Ordem de Serviço</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select
                  value={form.clienteId}
                  onValueChange={(v) =>
                    setForm({ ...form, clienteId: v, veiculoId: "" })
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
                <Label>Veículo</Label>
                <Select
                  value={form.veiculoId}
                  onValueChange={(v) =>
                    setForm({ ...form, veiculoId: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {veiculosFiltrados.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.marca} {v.modelo} - {v.placa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Descrição do Serviço</Label>
                <Textarea
                  value={form.descricaoServico}
                  onChange={(e) =>
                    setForm({ ...form, descricaoServico: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.valor}
                  onChange={(e) =>
                    setForm({ ...form, valor: e.target.value })
                  }
                  required
                />
              </div>

              {/* Peças */}
              <div className="space-y-2">
                <Label>Peças Utilizadas</Label>
                <div className="flex gap-2">
                  <Select value={pecaId} onValueChange={setPecaId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecionar peça" />
                    </SelectTrigger>
                    <SelectContent>
                      {estoque.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.nome} (disp: {e.quantidade})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    value={pecaQtd}
                    onChange={(e) => setPecaQtd(e.target.value)}
                    className="w-20"
                  />
                  <Button type="button" variant="outline" onClick={addPeca}>
                    +
                  </Button>
                </div>
                {form.pecasUsadas.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {form.pecasUsadas.map((p, i) => {
                      const item = estoque.find(
                        (e) => e.id === p.itemEstoqueId,
                      );
                      return (
                        <li
                          key={i}
                          className="flex items-center justify-between rounded bg-muted px-2 py-1 text-sm"
                        >
                          <span>
                            {item?.nome} x{p.quantidade}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePeca(i)}
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <Button type="submit" className="w-full">
                Criar OS
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ordens de Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          {ordens.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Nenhuma ordem de serviço
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordens.map((os) => (
                  <TableRow key={os.id}>
                    <TableCell className="font-medium">
                      #{os.numero}
                    </TableCell>
                    <TableCell>
                      {clienteMap[os.clienteId]?.nome ?? "—"}
                    </TableCell>
                    <TableCell>
                      {veiculoMap[os.veiculoId] ?? "—"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {os.descricaoServico}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(os.valor)}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>{formatDate(os.criadoEm)}</TableCell>
                    <TableCell className="text-right">
                      {os.status === "aberta" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Iniciar"
                          onClick={() =>
                            handleStatusChange(os, "em_andamento")
                          }
                        >
                          <Play className="h-4 w-4 text-blue-500" />
                        </Button>
                      )}
                      {(os.status === "aberta" ||
                        os.status === "em_andamento") && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Concluir"
                            onClick={() =>
                              handleStatusChange(os, "concluida")
                            }
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Cancelar"
                            onClick={() =>
                              handleStatusChange(os, "cancelada")
                            }
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Enviar no WhatsApp"
                        onClick={() => compartilharWhatsApp(os)}
                      >
                        <MessageCircle className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Imprimir (Térmica)"
                        onClick={() => imprimirTermica(os)}
                      >
                        <Printer className="h-4 w-4 text-gray-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
