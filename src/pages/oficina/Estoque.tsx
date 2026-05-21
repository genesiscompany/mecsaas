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
import { useAuth } from "@/lib/auth";
import {
  getEstoque,
  createItemEstoque,
  updateItemEstoque,
  deleteItemEstoque,
  ajustarEstoque,
} from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import {
  ESTOQUE_CATEGORIAS_PADRAO,
  type ItemEstoque,
} from "@/lib/types";
import { toast } from "sonner";

export default function Estoque() {
  const { user } = useAuth();
  const oficinaId = user?.oficinaId ?? "";
  const [estoque, setEstoque] = useState(() => getEstoque(oficinaId));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ItemEstoque | null>(null);
  const [ajusteDialogOpen, setAjusteDialogOpen] = useState(false);
  const [ajusteItem, setAjusteItem] = useState<ItemEstoque | null>(null);
  const [ajusteQtd, setAjusteQtd] = useState("");
  const [ajusteTipo, setAjusteTipo] = useState<"entrada" | "saida">(
    "entrada",
  );

  const [form, setForm] = useState({
    nome: "",
    categoria: "Peças",
    quantidade: "",
    precoUnitario: "",
    estoqueMinimo: "",
  });
  const [novaCategoria, setNovaCategoria] = useState("");
  const [showNovaCategoria, setShowNovaCategoria] = useState(false);

  // Build dynamic categories list from defaults + existing items
  const categoriasExistentes = [...new Set(estoque.map((e) => e.categoria))];
  const todasCategorias = [...new Set([...ESTOQUE_CATEGORIAS_PADRAO, ...categoriasExistentes])].sort();

  const refresh = useCallback(
    () => setEstoque(getEstoque(oficinaId)),
    [oficinaId],
  );

  function resetForm() {
    setForm({
      nome: "",
      categoria: "Peças",
      quantidade: "",
      precoUnitario: "",
      estoqueMinimo: "",
    });
    setEditing(null);
    setNovaCategoria("");
    setShowNovaCategoria(false);
  }

  function openEdit(item: ItemEstoque) {
    setEditing(item);
    setForm({
      nome: item.nome,
      categoria: item.categoria,
      quantidade: String(item.quantidade),
      precoUnitario: String(item.precoUnitario),
      estoqueMinimo: String(item.estoqueMinimo),
    });
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      nome: form.nome,
      categoria: form.categoria,
      quantidade: parseInt(form.quantidade),
      precoUnitario: parseFloat(form.precoUnitario),
      estoqueMinimo: parseInt(form.estoqueMinimo),
      oficinaId,
    };
    if (editing) {
      updateItemEstoque(editing.id, payload);
    } else {
      createItemEstoque(payload);
    }
    refresh();
    setDialogOpen(false);
    resetForm();
  }

  function handleDelete(id: string) {
    const ok = deleteItemEstoque(id);
    if (!ok) {
      toast.error("Não é possível excluir item vinculado a uma OS");
      return;
    }
    refresh();
  }

  function handleAjuste(e: React.FormEvent) {
    e.preventDefault();
    if (!ajusteItem) return;
    const delta =
      ajusteTipo === "entrada"
        ? parseInt(ajusteQtd)
        : -parseInt(ajusteQtd);
    ajustarEstoque(ajusteItem.id, delta);
    refresh();
    setAjusteDialogOpen(false);
    setAjusteItem(null);
    setAjusteQtd("");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Estoque e Serviços</h1>
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
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar Item" : "Novo Item"}
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
                <Label>Categoria</Label>
                {showNovaCategoria ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nome da nova categoria"
                      value={novaCategoria}
                      onChange={(e) => setNovaCategoria(e.target.value)}
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (novaCategoria.trim()) {
                          setForm({ ...form, categoria: novaCategoria.trim() });
                          setShowNovaCategoria(false);
                        }
                      }}
                    >
                      OK
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowNovaCategoria(false)}
                    >
                      X
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Select
                      value={form.categoria}
                      onValueChange={(v) => {
                        if (v === "__nova__") {
                          setShowNovaCategoria(true);
                        } else {
                          setForm({ ...form, categoria: v });
                        }
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {todasCategorias.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                        <SelectItem value="__nova__">+ Nova Categoria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    value={form.quantidade}
                    onChange={(e) =>
                      setForm({ ...form, quantidade: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço Unit.</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.precoUnitario}
                    onChange={(e) =>
                      setForm({ ...form, precoUnitario: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Est. Mínimo</Label>
                  <Input
                    type="number"
                    value={form.estoqueMinimo}
                    onChange={(e) =>
                      setForm({ ...form, estoqueMinimo: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editing ? "Salvar" : "Adicionar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itens em Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          {estoque.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Nenhum item no estoque
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead className="text-right">Preço Unit.</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estoque.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.nome}
                      {item.quantidade <= item.estoqueMinimo && (
                        <Badge
                          variant="destructive"
                          className="ml-2"
                        >
                          Baixo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.categoria}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.quantidade}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.precoUnitario)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Entrada"
                        onClick={() => {
                          setAjusteItem(item);
                          setAjusteTipo("entrada");
                          setAjusteDialogOpen(true);
                        }}
                      >
                        <ArrowUp className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Saída"
                        onClick={() => {
                          setAjusteItem(item);
                          setAjusteTipo("saida");
                          setAjusteDialogOpen(true);
                        }}
                      >
                        <ArrowDown className="h-4 w-4 text-red-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
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

      <Dialog
        open={ajusteDialogOpen}
        onOpenChange={(o) => {
          setAjusteDialogOpen(o);
          if (!o) {
            setAjusteItem(null);
            setAjusteQtd("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {ajusteTipo === "entrada"
                ? "Entrada de Estoque"
                : "Saída de Estoque"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAjuste} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Item: <strong>{ajusteItem?.nome}</strong> — Qtd atual:{" "}
              {ajusteItem?.quantidade}
            </p>
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                type="number"
                min="1"
                value={ajusteQtd}
                onChange={(e) => setAjusteQtd(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Confirmar
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
