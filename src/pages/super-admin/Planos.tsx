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
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPlanos, updatePlano } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Pencil } from "lucide-react";
import type { Plano } from "@/lib/types";

export default function Planos() {
  const [planos, setPlanos] = useState(() => getPlanos());
  const [editing, setEditing] = useState<Plano | null>(null);
  const [valor, setValor] = useState("");

  const refresh = useCallback(() => setPlanos(getPlanos()), []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    updatePlano(editing.id, { valor: parseFloat(valor) });
    refresh();
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestão de Planos</h1>

      <Card>
        <CardHeader>
          <CardTitle>Planos Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plano</TableHead>
                <TableHead>Periodicidade</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nome}</TableCell>
                  <TableCell className="capitalize">
                    {p.periodicidade}
                  </TableCell>
                  <TableCell>{formatCurrency(p.valor)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditing(p);
                        setValor(String(p.valor));
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Plano {editing?.nome}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Salvar
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
