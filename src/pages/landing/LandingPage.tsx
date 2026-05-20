import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPlanos } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import {
  Wrench,
  BarChart3,
  Package,
  FileText,
  Users,
  ShieldCheck,
  Check,
  ArrowRight,
  Zap,
  TrendingUp,
  Clock,
  Star,
  ChevronRight,
  Car,
  DollarSign,
  PieChart,
  Layers,
  Paintbrush,
  Hammer,
} from "lucide-react";

export default function LandingPage() {
  const [, navigate] = useLocation();
  const planos = getPlanos();

  const features = [
    {
      icon: FileText,
      title: "Ordens de Serviço",
      desc: "Crie, acompanhe e conclua OS de mecânica, funilaria e pintura com vínculo automático de peças, clientes e veículos.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: DollarSign,
      title: "Financeiro Completo",
      desc: "Receitas, despesas, contas a pagar e receber, caixa diário com 5 formas de pagamento.",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      icon: Package,
      title: "Controle de Estoque",
      desc: "Gerencie pneus, peças, óleos, filtros, tintas, verniz e massas com alertas de estoque baixo e entrada/saída automática.",
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      icon: Users,
      title: "Cadastros Completos",
      desc: "Clientes, veículos e fornecedores organizados com todos os dados necessários.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      icon: PieChart,
      title: "Relatórios Detalhados",
      desc: "Faturamento, lucro, despesas por categoria e serviços de mecânica e funilaria com gráficos interativos.",
      color: "from-rose-500 to-rose-600",
      bgColor: "bg-rose-50",
      iconColor: "text-rose-600",
    },
    {
      icon: Paintbrush,
      title: "Funilaria & Pintura",
      desc: "Categorias específicas: funilaria, pintura, polimento, martelinho de ouro. Controle de tintas, verniz e massas.",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      icon: ShieldCheck,
      title: "Multi-tenant Seguro",
      desc: "Cada oficina com dados isolados. Controle de acesso por nível. Segurança total.",
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50",
      iconColor: "text-cyan-600",
    },
  ];

  const stats = [
    { value: "500+", label: "Oficinas & Funilarias", icon: Car },
    { value: "50.000+", label: "OS Realizadas", icon: FileText },
    { value: "R$ 10M+", label: "Faturado", icon: TrendingUp },
    { value: "99.9%", label: "Uptime", icon: Zap },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Cadastre sua Oficina",
      desc: "Escolha um plano e cadastre sua oficina ou funilaria em minutos.",
      icon: Layers,
    },
    {
      step: "02",
      title: "Configure seus Dados",
      desc: "Cadastre clientes, veículos, fornecedores e estoque.",
      icon: Users,
    },
    {
      step: "03",
      title: "Comece a Gerenciar",
      desc: "Crie ordens de serviço e acompanhe tudo em tempo real.",
      icon: FileText,
    },
    {
      step: "04",
      title: "Analise Resultados",
      desc: "Visualize relatórios detalhados e tome decisões inteligentes.",
      icon: BarChart3,
    },
  ];

  const benefits = [
    "Sem limite de funcionalidades",
    "Sem limite de usuários",
    "Sem limite de ordens de serviço",
    "Suporte técnico incluso",
    "Atualizações automáticas",
    "Dados seguros na nuvem",
  ];

  const testimonials = [
    {
      name: "Carlos Silva",
      role: "Dono — Auto Center Silva",
      text: "Desde que comecei a usar o macSaas, a organização da minha oficina melhorou 100%. O controle de estoque e as OS automáticas economizam horas do meu dia.",
      stars: 5,
    },
    {
      name: "Ana Oliveira",
      role: "Gestora — Funilaria Premium",
      text: "Consigo controlar tintas, verniz e massas no estoque, além de gerar OS específicas de funilaria e pintura. Os relatórios financeiros são incríveis!",
      stars: 5,
    },
    {
      name: "Roberto Santos",
      role: "Mecânico — RS Mecânica & Pintura",
      text: "Interface muito simples de usar. Atendo mecânica e funilaria no mesmo sistema. Quando concluo a OS, tudo atualiza automaticamente.",
      stars: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-700 bg-gray-900/95 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-2">
          <img
            src="/logo.png"
            alt="macSaas.com.br"
            className="h-12 object-contain"
          />
          <nav className="flex items-center gap-4 md:gap-6">
            <a href="#funcionalidades" className="text-sm text-gray-300 hover:text-white transition-colors">Funcionalidades</a>
            <a href="#como-funciona" className="text-sm text-gray-300 hover:text-white transition-colors">Como Funciona</a>
            <a href="#planos" className="text-sm text-gray-300 hover:text-white transition-colors">Planos</a>
            <a href="#depoimentos" className="text-sm text-gray-300 hover:text-white transition-colors">Depoimentos</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-sm text-gray-300 hover:text-white hover:bg-white/10"
              onClick={() => navigate("/login")}
            >
              Login Oficina
            </Button>
            <Button
              className="text-sm bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => navigate("/super-admin/login")}
            >
              Super Admin
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/banner-hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />
        <div className="container relative mx-auto px-4 py-14 md:py-20">
          <div className="max-w-3xl">
            <Badge className="mb-6 border-orange-400/30 bg-orange-500/20 px-4 py-1.5 text-sm font-medium text-orange-300 hover:bg-orange-500/30">
              <Zap className="mr-1 h-3.5 w-3.5" />
              Plataforma #1 para Oficinas, Funilarias e Pinturas
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              Gestão completa para sua{" "}
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                Oficina, Funilaria & Pintura
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-300 md:text-lg">
              Controle financeiro, estoque, ordens de serviço e cadastros em um
              único lugar. Mecânica, funilaria e pintura integradas na
              plataforma mais completa do mercado.
            </p>
            <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-600 px-8 text-base shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl hover:shadow-orange-500/40"
                onClick={() => {
                  document
                    .getElementById("planos")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Começar Agora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 px-8 text-base text-white hover:bg-white/10"
                onClick={() => {
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Conhecer Recursos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-2xl border bg-white p-4 shadow-2xl">
              <div className="rounded-xl border bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <span className="ml-3 text-sm text-gray-400">
                    dashboard.macsaas.com.br
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <div className="text-xs text-gray-500">Receitas</div>
                    <div className="mt-1 text-xl font-bold text-green-600">
                      R$ 45.200
                    </div>
                    <div className="mt-1 text-xs text-green-500">
                      +12% este mês
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <div className="text-xs text-gray-500">Despesas</div>
                    <div className="mt-1 text-xl font-bold text-red-600">
                      R$ 18.500
                    </div>
                    <div className="mt-1 text-xs text-red-500">
                      -5% este mês
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <div className="text-xs text-gray-500">OS Ativas</div>
                    <div className="mt-1 text-xl font-bold text-blue-600">
                      24
                    </div>
                    <div className="mt-1 text-xs text-blue-500">
                      8 concluídas hoje
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <div className="text-xs text-gray-500">Clientes</div>
                    <div className="mt-1 text-xl font-bold text-purple-600">
                      342
                    </div>
                    <div className="mt-1 text-xs text-purple-500">
                      +15 esta semana
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div className="col-span-2 rounded-lg bg-white p-4 shadow-sm">
                    <div className="text-xs font-medium text-gray-500">
                      Faturamento Mensal
                    </div>
                    <div className="mt-3 flex items-end gap-1">
                      {[35, 45, 38, 52, 48, 65, 58, 72, 68, 80, 75, 90].map(
                        (h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t bg-gradient-to-t from-blue-500 to-blue-400 transition-all"
                            style={{ height: `${h}px` }}
                          />
                        ),
                      )}
                    </div>
                    <div className="mt-2 flex justify-between text-[10px] text-gray-400">
                      <span>Jan</span>
                      <span>Fev</span>
                      <span>Mar</span>
                      <span>Abr</span>
                      <span>Mai</span>
                      <span>Jun</span>
                      <span>Jul</span>
                      <span>Ago</span>
                      <span>Set</span>
                      <span>Out</span>
                      <span>Nov</span>
                      <span>Dez</span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-4 shadow-sm">
                    <div className="text-xs font-medium text-gray-500">
                      Serviços por Tipo
                    </div>
                    <div className="mt-3 flex items-center justify-center">
                      <div className="relative h-24 w-24">
                        <svg viewBox="0 0 36 36" className="h-24 w-24">
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="3"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeDasharray="40 60"
                            strokeDashoffset="0"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9"
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="3"
                            strokeDasharray="25 75"
                            strokeDashoffset="-40"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9"
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="3"
                            strokeDasharray="20 80"
                            strokeDashoffset="-65"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="15.9"
                            fill="none"
                            stroke="#8b5cf6"
                            strokeWidth="3"
                            strokeDasharray="15 85"
                            strokeDashoffset="-85"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-1 text-[10px]">
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        Mecânica
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        Funilaria
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        Pintura
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-purple-500" />
                        Polimento
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <s.icon className="mx-auto mb-3 h-8 w-8 text-blue-200" />
                <div className="text-3xl font-extrabold text-white md:text-4xl">
                  {s.value}
                </div>
                <div className="mt-1 text-sm text-blue-200">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              Funcionalidades
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Tudo que seu negócio precisa
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Ferramentas completas para gerenciar mecânica, funilaria e
              pintura
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <Card
                key={f.title}
                className="group border-0 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <CardHeader>
                  <div
                    className={`mb-3 flex h-14 w-14 items-center justify-center rounded-xl ${f.bgColor} transition-transform group-hover:scale-110`}
                  >
                    <f.icon className={`h-7 w-7 ${f.iconColor}`} />
                  </div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {f.desc}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" className="bg-gradient-to-b from-gray-50 to-white py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              Como funciona
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Comece em 4 passos simples
            </h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-4">
            {howItWorks.map((item, i) => (
              <div key={item.step} className="relative text-center">
                {i < howItWorks.length - 1 && (
                  <ChevronRight className="absolute -right-5 top-12 hidden h-6 w-6 text-gray-300 md:block" />
                )}
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200">
                  <item.icon className="h-9 w-9" />
                </div>
                <div className="mt-2 text-xs font-bold text-blue-600">
                  PASSO {item.step}
                </div>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Highlight */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 shadow-2xl md:p-16">
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">
                  Automação Inteligente
                </Badge>
                <h2 className="text-3xl font-bold text-white md:text-4xl">
                  Integração automática entre módulos
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-blue-100">
                  Ao concluir uma Ordem de Serviço, o sistema automaticamente:
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Registra a receita no financeiro",
                    "Atualiza o estoque das peças utilizadas",
                    "Lança a entrada no caixa diário",
                    "Atualiza os relatórios em tempo real",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-400 text-white">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-white">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 rounded-lg bg-white/20 p-3">
                        <FileText className="h-5 w-5 text-white" />
                        <div>
                          <div className="text-sm font-medium text-white">
                            OS #1042 — Concluída
                          </div>
                          <div className="text-xs text-blue-200">
                            Funilaria + Pintura Parcial
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <div className="h-6 w-px bg-white/30" />
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2 rounded-lg bg-green-400/20 p-2.5">
                          <DollarSign className="h-4 w-4 text-green-300" />
                          <span className="text-xs text-green-100">
                            Receita: R$ 350,00
                          </span>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-amber-400/20 p-2.5">
                          <Package className="h-4 w-4 text-amber-300" />
                          <span className="text-xs text-amber-100">
                            Estoque atualizado
                          </span>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-purple-400/20 p-2.5">
                          <Clock className="h-4 w-4 text-purple-300" />
                          <span className="text-xs text-purple-100">
                            Caixa: +R$ 350,00
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="bg-gray-50 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              Depoimentos
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              O que nossos clientes dizem
            </h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-gray-600">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                      {t.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              Preços
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Escolha o plano ideal
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Todos os planos incluem todas as funcionalidades sem limites
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
            {planos.map((plano) => {
              const isPopular = plano.nome === "Anual";
              return (
                <Card
                  key={plano.id}
                  className={`relative transition-all hover:-translate-y-1 ${
                    isPopular
                      ? "border-2 border-blue-600 shadow-xl shadow-blue-100"
                      : "border shadow-md hover:shadow-lg"
                  }`}
                >
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 px-4">
                      Mais Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">{plano.nome}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-extrabold">
                        {formatCurrency(plano.valor)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        /{plano.periodicidade}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {benefits.map((b) => (
                        <li
                          key={b}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                            <Check className="h-3 w-3 text-green-600" />
                          </div>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className={`w-full ${
                        isPopular
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-200"
                          : ""
                      }`}
                      variant={isPopular ? "default" : "outline"}
                      onClick={() => navigate("/login")}
                    >
                      Contratar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Pronto para transformar sua oficina ou funilaria?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
            Mecânica, funilaria e pintura em um só lugar. Comece hoje e veja
            a diferença que uma gestão organizada faz no seu negócio.
          </p>
          <Button
            size="lg"
            className="mt-8 bg-white px-8 text-blue-600 shadow-lg hover:bg-gray-100"
            onClick={() => navigate("/login")}
          >
            Começar Gratuitamente
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-900 py-12 text-gray-400">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <img
                src="/logo.png"
                alt="macSaas.com.br"
                className="h-12 object-contain"
              />
              <p className="mt-3 text-sm leading-relaxed">
                Sistema completo de gestão para oficinas mecânicas, funilarias
                e pinturas. Simplifique sua operação.
              </p>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-white">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li>Funcionalidades</li>
                <li>Preços</li>
                <li>Integrações</li>
                <li>Atualizações</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-white">Suporte</h4>
              <ul className="space-y-2 text-sm">
                <li>Central de Ajuda</li>
                <li>Documentação</li>
                <li>Contato</li>
                <li>Status do Sistema</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-white">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>Termos de Uso</li>
                <li>Privacidade</li>
                <li>LGPD</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
            &copy; 2024 macSaas.com.br. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
