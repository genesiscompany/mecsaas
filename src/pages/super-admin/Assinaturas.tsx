import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  getOficinas,
  getPlanos,
  getAssinaturas,
  addAssinaturaToCache,
  reloadAssinaturas,
} from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import {
  CreditCard,
  ExternalLink,
  Send,
  RefreshCw,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Assinatura, AssinaturaStatus } from "@/lib/types";

const statusConfig: Record<AssinaturaStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle }> = {
  authorized: { label: "Ativa", variant: "default", icon: CheckCircle },
  pending: { label: "Pendente", variant: "outline", icon: Clock },
  paused: { label: "Pausada", variant: "secondary", icon: AlertCircle },
  cancelled: { label: "Cancelada", variant: "destructive", icon: XCircle },
};

export default function Assinaturas() {
  const [assinaturas, setAssinaturas] = useState(() => getAssinaturas());
  const oficinas = getOficinas();
  const planos = getPlanos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedOficinaId, setSelectedOficinaId] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(() => setAssinaturas(getAssinaturas()), []);

  const oficinaMap = Object.fromEntries(oficinas.map((o) => [o.id, o]));
  const planoMap = Object.fromEntries(planos.map((p) => [p.id, p]));

  // Oficinas without active subscription
  const oficinasDisponiveis = oficinas.filter(
    (o) => !assinaturas.some((a) => a.oficinaId === o.id && (a.status === "authorized" || a.status === "pending")),
  );

  async function handleCreateSubscription() {
    if (!selectedOficinaId) return;
    setLoading(true);
    setGeneratedLink("");

    const oficina = oficinaMap[selectedOficinaId];
    if (!oficina) return;

    const plano = planoMap[oficina.planoId];
    if (!plano) return;

    try {
      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oficina_id: oficina.id,
          plano_id: plano.id,
          plano_nome: plano.nome,
          valor: plano.valor,
          payer_email: oficina.adminEmail,
          oficina_nome: oficina.nome,
        }),
      });

      const data = await response.json();

      if (response.ok && data.init_point) {
        setGeneratedLink(data.init_point);
        addAssinaturaToCache({
          id: data.id,
          oficinaId: oficina.id,
          planoId: plano.id,
          mpPreapprovalId: data.mp_preapproval_id,
          mpInitPoint: data.init_point,
          status: "pending",
          valor: plano.valor,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        refresh();
      } else {
        alert("Erro ao criar assinatura: " + (data.error || "Erro desconhecido"));
      }
    } catch (err) {
      alert("Erro de conexão. Verifique se as variáveis de ambiente estão configuradas na Vercel.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await reloadAssinaturas();
      refresh();
    } finally {
      setRefreshing(false);
    }
  }

  function handleShareWhatsApp(assinatura: Assinatura) {
    const oficina = oficinaMap[assinatura.oficinaId];
    if (!oficina || !assinatura.mpInitPoint) return;

    const plano = planoMap[assinatura.planoId];
    const msg = encodeURIComponent(
      `Olá ${oficina.adminNome}! Segue o link para ativar sua assinatura do plano ${plano?.nome || ""} no macSaas:\n\n${assinatura.mpInitPoint}\n\nApós o pagamento, seu acesso será liberado automaticamente.`,
    );
    const phone = oficina.telefone.replace(/\D/g, "");
    window.open(`https://wa.me/55${phone}?text=${msg}`, "_blank");
  }

  function formatDate(date?: string) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("pt-BR");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assinaturas</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie assinaturas e cobranças via Mercado Pago
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button onClick={() => { setDialogOpen(true); setSelectedOficinaId(""); setGeneratedLink(""); }}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Assinatura
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{assinaturas.filter((a) => a.status === "authorized").length}</p>
                <p className="text-xs text-muted-foreground">Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-2">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{assinaturas.filter((a) => a.status === "pending").length}</p>
                <p className="text-xs text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{assinaturas.filter((a) => a.status === "paused").length}</p>
                <p className="text-xs text-muted-foreground">Pausadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(assinaturas.filter((a) => a.status === "authorized").reduce((sum, a) => sum + a.valor, 0))}
                </p>
                <p className="text-xs text-muted-foreground">Receita Recorrente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions table */}
      <Card>
        <CardHeader>
          <CardTitle>Assinaturas</CardTitle>
        </CardHeader>
        <CardContent>
          {assinaturas.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Nenhuma assinatura criada
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Oficina</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead>Último Pgto</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assinaturas.map((a) => {
                  const oficina = oficinaMap[a.oficinaId];
                  const plano = planoMap[a.planoId];
                  const cfg = statusConfig[a.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{oficina?.nome || "—"}</TableCell>
                      <TableCell>{plano?.nome || "—"}</TableCell>
                      <TableCell>{formatCurrency(a.valor)}</TableCell>
                      <TableCell>
                        <Badge variant={cfg.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(a.createdAt)}</TableCell>
                      <TableCell>{formatDate(a.ultimoPagamento)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {a.mpInitPoint && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Abrir link de pagamento"
                                onClick={() => window.open(a.mpInitPoint, "_blank")}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Enviar via WhatsApp"
                                onClick={() => handleShareWhatsApp(a)}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create subscription dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Assinatura</DialogTitle>
          </DialogHeader>

          {generatedLink ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-600" />
                <p className="font-medium text-green-800">Link de pagamento gerado!</p>
                <p className="mt-1 text-sm text-green-600">Envie este link para o dono da oficina</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="break-all text-xs text-gray-600">{generatedLink}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedLink);
                    alert("Link copiado!");
                  }}
                >
                  Copiar Link
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => window.open(generatedLink, "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir
                </Button>
              </div>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => { setDialogOpen(false); setGeneratedLink(""); }}
              >
                Fechar
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Selecione a Oficina</Label>
                <Select value={selectedOficinaId} onValueChange={setSelectedOficinaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha uma oficina..." />
                  </SelectTrigger>
                  <SelectContent>
                    {oficinasDisponiveis.length === 0 ? (
                      <SelectItem value="none" disabled>
                        Todas as oficinas já têm assinatura
                      </SelectItem>
                    ) : (
                      oficinasDisponiveis.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.nome} — {planoMap[o.planoId]?.nome || ""} ({formatCurrency(planoMap[o.planoId]?.valor || 0)})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedOficinaId && (
                <div className="rounded-lg bg-blue-50 p-3 text-sm">
                  <p className="font-medium text-blue-800">Resumo:</p>
                  <p className="text-blue-600">
                    Oficina: {oficinaMap[selectedOficinaId]?.nome}
                  </p>
                  <p className="text-blue-600">
                    Plano: {planoMap[oficinaMap[selectedOficinaId]?.planoId]?.nome} — {formatCurrency(planoMap[oficinaMap[selectedOficinaId]?.planoId]?.valor || 0)}
                  </p>
                  <p className="text-blue-600">
                    Email: {oficinaMap[selectedOficinaId]?.adminEmail}
                  </p>
                </div>
              )}

              <Button
                className="w-full"
                disabled={!selectedOficinaId || loading}
                onClick={handleCreateSubscription}
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Gerando link...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Gerar Link de Pagamento
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
