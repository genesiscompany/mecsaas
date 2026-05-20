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
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getOficinas,
  getPlanos,
  createOficina,
  updateOficina,
  toggleOficinaStatus,
} from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { Plus, Pencil, Power } from "lucide-react";
import type { Oficina } from "@/lib/types";

export default function Oficinas() {
  const [oficinas, setOficinas] = useState(() => getOficinas());
  const planos = getPlanos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Oficina | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Oficina | null>(null);

  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
    endereco: "",
    planoId: planos[0]?.id ?? "",
    adminNome: "",
    adminEmail: "",
    adminSenha: "",
  });

  const refresh = useCallback(() => setOficinas(getOficinas()), []);

  function resetForm() {
    setForm({
      nome: "",
      cnpj: "",
      telefone: "",
      email: "",
      endereco: "",
      planoId: planos[0]?.id ?? "",
      adminNome: "",
      adminEmail: "",
      adminSenha: "",
    });
    setEditing(null);
  }

  function openEdit(oficina: Oficina) {
    setEditing(oficina);
    setForm({
      nome: oficina.nome,
      cnpj: oficina.cnpj,
      telefone: oficina.telefone,
      email: oficina.email,
      endereco: oficina.endereco,
      planoId: oficina.planoId,
      adminNome: oficina.adminNome,
      adminEmail: oficina.adminEmail,
      adminSenha: oficina.adminSenha,
    });
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      updateOficina(editing.id, form);
    } else {
      createOficina({ ...form, ativa: true });
    }
    refresh();
    setDialogOpen(false);
    resetForm();
  }

  function handleToggle() {
    if (!toggleTarget) return;
    toggleOficinaStatus(toggleTarget.id);
    refresh();
    setToggleTarget(null);
  }

  const planoMap = Object.fromEntries(planos.map((p) => [p.id, p.nome]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestão de Oficinas</h1>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Oficina
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar Oficina" : "Nova Oficina"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={form.nome}
                    onChange={(e) =>
                      setForm({ ...form, nome: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input
                    value={form.cnpj}
                    onChange={(e) =>
                      setForm({ ...form, cnpj: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={form.telefone}
                    onChange={(e) =>
                      setForm({ ...form, telefone: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Endereço</Label>
                  <Input
                    value={form.endereco}
                    onChange={(e) =>
                      setForm({ ...form, endereco: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Plano</Label>
                  <Select
                    value={form.planoId}
                    onValueChange={(v) => setForm({ ...form, planoId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {planos.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="mb-3 font-medium">Admin da Oficina</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nome do Admin</Label>
                    <Input
                      value={form.adminNome}
                      onChange={(e) =>
                        setForm({ ...form, adminNome: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email do Admin</Label>
                    <Input
                      type="email"
                      value={form.adminEmail}
                      onChange={(e) =>
                        setForm({ ...form, adminEmail: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Senha do Admin</Label>
                    <Input
                      type="password"
                      value={form.adminSenha}
                      onChange={(e) =>
                        setForm({ ...form, adminSenha: e.target.value })
                      }
                      required={!editing}
                    />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editing ? "Salvar" : "Cadastrar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Oficinas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {oficinas.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Nenhuma oficina cadastrada
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {oficinas.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.nome}</TableCell>
                    <TableCell>{o.cnpj}</TableCell>
                    <TableCell>{planoMap[o.planoId] ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={o.ativa ? "default" : "secondary"}>
                        {o.ativa ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(o.criadoEm)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(o)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setToggleTarget(o)}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!toggleTarget}
        onOpenChange={(open) => {
          if (!open) setToggleTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleTarget?.ativa ? "Desativar" : "Ativar"} oficina?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleTarget?.ativa
                ? "A oficina não poderá mais acessar o sistema."
                : "A oficina poderá acessar o sistema novamente."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggle}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
