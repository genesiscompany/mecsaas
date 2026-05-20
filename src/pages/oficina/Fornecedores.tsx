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
import { useAuth } from "@/lib/auth";
import {
  getFornecedores,
  createFornecedor,
  updateFornecedor,
  deleteFornecedor,
} from "@/lib/store";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Fornecedor } from "@/lib/types";
import { toast } from "sonner";

export default function Fornecedores() {
  const { user } = useAuth();
  const oficinaId = user?.oficinaId ?? "";
  const [fornecedores, setFornecedores] = useState(() =>
    getFornecedores(oficinaId),
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Fornecedor | null>(null);

  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
  });

  const refresh = useCallback(
    () => setFornecedores(getFornecedores(oficinaId)),
    [oficinaId],
  );

  function resetForm() {
    setForm({ nome: "", cnpj: "", telefone: "", email: "" });
    setEditing(null);
  }

  function openEdit(f: Fornecedor) {
    setEditing(f);
    setForm({
      nome: f.nome,
      cnpj: f.cnpj,
      telefone: f.telefone,
      email: f.email,
    });
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      updateFornecedor(editing.id, { ...form, oficinaId });
    } else {
      createFornecedor({ ...form, oficinaId });
    }
    refresh();
    setDialogOpen(false);
    resetForm();
  }

  function handleDelete(id: string) {
    const ok = deleteFornecedor(id);
    if (!ok) {
      toast.error(
        "Não é possível excluir fornecedor com contas vinculadas",
      );
      return;
    }
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Fornecedores</h1>
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
              Novo Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar Fornecedor" : "Novo Fornecedor"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                />
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
          <CardTitle>Fornecedores Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {fornecedores.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Nenhum fornecedor cadastrado
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fornecedores.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.nome}</TableCell>
                    <TableCell>{f.cnpj}</TableCell>
                    <TableCell>{f.telefone}</TableCell>
                    <TableCell>{f.email || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(f)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(f.id)}
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
    </div>
  );
}
