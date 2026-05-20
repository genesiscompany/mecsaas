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
import { useAuth } from "@/lib/auth";
import {
  getVeiculos,
  getClientes,
  createVeiculo,
  updateVeiculo,
  deleteVeiculo,
} from "@/lib/store";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Veiculo } from "@/lib/types";
import { toast } from "sonner";

export default function Veiculos() {
  const { user } = useAuth();
  const oficinaId = user?.oficinaId ?? "";
  const [veiculos, setVeiculos] = useState(() => getVeiculos(oficinaId));
  const clientes = getClientes(oficinaId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Veiculo | null>(null);

  const [form, setForm] = useState({
    clienteId: "",
    placa: "",
    modelo: "",
    marca: "",
    ano: "",
  });

  const refresh = useCallback(
    () => setVeiculos(getVeiculos(oficinaId)),
    [oficinaId],
  );

  function resetForm() {
    setForm({ clienteId: "", placa: "", modelo: "", marca: "", ano: "" });
    setEditing(null);
  }

  function openEdit(v: Veiculo) {
    setEditing(v);
    setForm({
      clienteId: v.clienteId,
      placa: v.placa,
      modelo: v.modelo,
      marca: v.marca,
      ano: String(v.ano),
    });
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, ano: parseInt(form.ano), oficinaId };
    if (editing) {
      updateVeiculo(editing.id, payload);
    } else {
      createVeiculo(payload);
    }
    refresh();
    setDialogOpen(false);
    resetForm();
  }

  function handleDelete(id: string) {
    const ok = deleteVeiculo(id);
    if (!ok) {
      toast.error("Não é possível excluir veículo vinculado a uma OS");
      return;
    }
    refresh();
  }

  const clienteMap = Object.fromEntries(
    clientes.map((c) => [c.id, c.nome]),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Veículos</h1>
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
              Novo Veículo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar Veículo" : "Novo Veículo"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Proprietário</Label>
                <Select
                  value={form.clienteId}
                  onValueChange={(v) =>
                    setForm({ ...form, clienteId: v })
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Placa</Label>
                  <Input
                    value={form.placa}
                    onChange={(e) =>
                      setForm({ ...form, placa: e.target.value.toUpperCase() })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ano</Label>
                  <Input
                    type="number"
                    value={form.ano}
                    onChange={(e) =>
                      setForm({ ...form, ano: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Marca</Label>
                  <Input
                    value={form.marca}
                    onChange={(e) =>
                      setForm({ ...form, marca: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Input
                    value={form.modelo}
                    onChange={(e) =>
                      setForm({ ...form, modelo: e.target.value })
                    }
                    required
                  />
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
          <CardTitle>Veículos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {veiculos.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Nenhum veículo cadastrado
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placa</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Proprietário</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {veiculos.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.placa}</TableCell>
                    <TableCell>{v.marca}</TableCell>
                    <TableCell>{v.modelo}</TableCell>
                    <TableCell>{v.ano}</TableCell>
                    <TableCell>
                      {clienteMap[v.clienteId] ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(v)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(v.id)}
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
