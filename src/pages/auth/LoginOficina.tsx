import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wrench, ArrowLeft } from "lucide-react";

export default function LoginOficina() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = login(email, senha);
    if (result.success) {
      navigate("/oficina/dashboard");
    } else {
      setError(result.error || "Email ou senha inválidos");
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden flex-1 items-center justify-center bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-12 lg:flex">
        <div className="max-w-md text-center">
          <img
            src="/logo.png"
            alt="macSaas.com.br"
            className="mx-auto mb-4 h-16 object-contain"
          />
          <p className="mt-4 text-lg leading-relaxed text-emerald-100">
            Gerencie sua oficina, funilaria e pintura com a plataforma mais
            completa do mercado. Controle financeiro, estoque, OS e muito mais.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">OS</div>
              <div className="text-xs text-emerald-200">Ordens de Serviço</div>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">$</div>
              <div className="text-xs text-emerald-200">Financeiro</div>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">📦</div>
              <div className="text-xs text-emerald-200">Estoque</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center">
            <img
              src="/logo.png"
              alt="macSaas.com.br"
              className="mx-auto mb-2 h-14 rounded-lg bg-gray-900 p-2 object-contain"
            />
            <CardTitle className="text-2xl">Login da Oficina</CardTitle>
            <CardDescription>
              Acesse o painel de gestão da sua oficina
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="Sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button
                type="submit"
                className="h-11 w-full bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-200"
              >
                Entrar
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao início
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
