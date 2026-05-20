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
import { useAuth } from "@/lib/auth";
import {
  getDespesas,
  createDespesa,
  updateDespesa,
  deleteDespesa,
} from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  DESPESA_CATEGORIAS,
  type Despesa,
  type DespesaCategoria,
} from "@/lib/types";

export default function Despesas() {
  const { user } = useAuth();
  const oficinaId = user?.oficinaId ?? "";
  const [despesas, setDespesas] = useState(() => getDespesas(oficinaId));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Despesa | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    categoria: "compra_pecas" as DespesaCategoria,
    data: new Date().toISOString().split("T")[0],
  });

  const refresh = useCallback(
    () => setDespesas(getDespesas(oficinaId)),
    [oficinaId],
  );

  function resetForm() {
    setForm({
      descricao: "",
      valor: "",
      categoria: "compra_pecas",
      data: new Date().toISOString().split("T")[0],
    });
    setEditing(null);
  }

  function openEdit(d: Despesa) {
    setEditing(d);
    setForm({
      descricao: d.descricao,
      valor: String(d.valor),
      categoria: d.categoria,
      data: d.data,
    });
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      valor: parseFloat(form.valor),
      oficinaId,
    };
    if (editing) {
      updateDespesa(editing.id, payload);
    } else {
      createDespesa(payload);
    }
    refresh();
    setDialogOpen(false);
    resetForm();
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteDespesa(deleteTarget);
    refresh();
    setDeleteTarget(null);
  }

  const total = despesas.reduce((sum, d) => sum + d.valor, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Despesas</h1>
          <p className="text-muted-foreground">
            Total: {formatCurrency(total)}
          </p>
        </div>
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
              Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar Despesa" : "Nova Despesa"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={form.descricao}
                  onChange={(e) =>
                    setForm({ ...form, descricao: e.target.value })
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
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={form.categoria}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      categoria: v as DespesaCategoria,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DESPESA_CATEGORIAS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={form.data}
                  onChange={(e) =>
                    setForm({ ...form, data: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editing ? "Salvar" : "Registrar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Despesas Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          {despesas.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Nenhuma despesa registrada
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {despesas.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{formatDate(d.data)}</TableCell>
                    <TableCell className="font-medium">
                      {d.descricao}
                    </TableCell>
                    <TableCell>
                      {DESPESA_CATEGORIAS[d.categoria]}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {formatCurrency(d.valor)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(d)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(d.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir despesa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
