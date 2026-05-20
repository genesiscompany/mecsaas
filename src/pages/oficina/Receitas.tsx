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
  getReceitas,
  createReceita,
  updateReceita,
  deleteReceita,
} from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  RECEITA_CATEGORIAS,
  type Receita,
  type ReceitaCategoria,
} from "@/lib/types";

export default function Receitas() {
  const { user } = useAuth();
  const oficinaId = user?.oficinaId ?? "";
  const [receitas, setReceitas] = useState(() => getReceitas(oficinaId));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Receita | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    categoria: "servicos" as ReceitaCategoria,
    data: new Date().toISOString().split("T")[0],
  });

  const refresh = useCallback(
    () => setReceitas(getReceitas(oficinaId)),
    [oficinaId],
  );

  function resetForm() {
    setForm({
      descricao: "",
      valor: "",
      categoria: "servicos",
      data: new Date().toISOString().split("T")[0],
    });
    setEditing(null);
  }

  function openEdit(r: Receita) {
    setEditing(r);
    setForm({
      descricao: r.descricao,
      valor: String(r.valor),
      categoria: r.categoria,
      data: r.data,
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
      updateReceita(editing.id, payload);
    } else {
      createReceita(payload);
    }
    refresh();
    setDialogOpen(false);
    resetForm();
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteReceita(deleteTarget);
    refresh();
    setDeleteTarget(null);
  }

  const total = receitas.reduce((sum, r) => sum + r.valor, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Receitas</h1>
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
              Nova Receita
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar Receita" : "Nova Receita"}
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
                      categoria: v as ReceitaCategoria,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(RECEITA_CATEGORIAS).map(([k, v]) => (
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
          <CardTitle>Receitas Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          {receitas.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Nenhuma receita registrada
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
                {receitas.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{formatDate(r.data)}</TableCell>
                    <TableCell className="font-medium">
                      {r.descricao}
                    </TableCell>
                    <TableCell>
                      {RECEITA_CATEGORIAS[r.categoria]}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(r.valor)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(r)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(r.id)}
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
            <AlertDialogTitle>Excluir receita?</AlertDialogTitle>
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
