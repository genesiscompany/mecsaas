export type UserRole = "super_admin" | "oficina_admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  oficinaId?: string;
}

export interface Plano {
  id: string;
  nome: "Mensal" | "Trimestral" | "Anual";
  valor: number;
  periodicidade: string;
}

export interface Oficina {
  id: string;
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  planoId: string;
  ativa: boolean;
  criadoEm: string;
  adminNome: string;
  adminEmail: string;
  adminSenha: string;
}

export interface Receita {
  id: string;
  oficinaId: string;
  descricao: string;
  valor: number;
  categoria: ReceitaCategoria;
  data: string;
  ordemServicoId?: string;
}

export type ReceitaCategoria =
  | "servicos"
  | "venda_pecas"
  | "venda_pneus"
  | "alinhamento"
  | "balanceamento"
  | "troca_oleo"
  | "funilaria"
  | "pintura"
  | "polimento"
  | "martelinho_ouro";

export const RECEITA_CATEGORIAS: Record<ReceitaCategoria, string> = {
  servicos: "Serviços",
  venda_pecas: "Venda de Peças",
  venda_pneus: "Venda de Pneus",
  alinhamento: "Alinhamento",
  balanceamento: "Balanceamento",
  troca_oleo: "Troca de Óleo",
  funilaria: "Funilaria",
  pintura: "Pintura",
  polimento: "Polimento",
  martelinho_ouro: "Martelinho de Ouro",
};

export interface Despesa {
  id: string;
  oficinaId: string;
  descricao: string;
  valor: number;
  categoria: DespesaCategoria;
  data: string;
}

export type DespesaCategoria =
  | "compra_pecas"
  | "compra_pneus"
  | "funcionarios"
  | "aluguel"
  | "energia"
  | "agua_internet"
  | "impostos"
  | "ferramentas"
  | "materiais_pintura"
  | "lixas_abrasivos"
  | "massas_primers";

export const DESPESA_CATEGORIAS: Record<DespesaCategoria, string> = {
  compra_pecas: "Compra de Peças",
  compra_pneus: "Compra de Pneus",
  funcionarios: "Funcionários",
  aluguel: "Aluguel",
  energia: "Energia",
  agua_internet: "Água/Internet",
  impostos: "Impostos",
  ferramentas: "Ferramentas",
  materiais_pintura: "Materiais de Pintura",
  lixas_abrasivos: "Lixas e Abrasivos",
  massas_primers: "Massas e Primers",
};

export type EstoqueCategoria =
  | "pneus"
  | "pecas"
  | "oleo"
  | "filtros"
  | "tintas"
  | "verniz"
  | "lixas"
  | "massas";

export const ESTOQUE_CATEGORIAS: Record<EstoqueCategoria, string> = {
  pneus: "Pneus",
  pecas: "Peças",
  oleo: "Óleo",
  filtros: "Filtros",
  tintas: "Tintas",
  verniz: "Verniz",
  lixas: "Lixas",
  massas: "Massas",
};

export interface ItemEstoque {
  id: string;
  oficinaId: string;
  nome: string;
  categoria: EstoqueCategoria;
  quantidade: number;
  precoUnitario: number;
  estoqueMinimo: number;
}

export type OSStatus = "aberta" | "em_andamento" | "concluida" | "cancelada";

export const OS_STATUS_LABELS: Record<OSStatus, string> = {
  aberta: "Aberta",
  em_andamento: "Em Andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

export interface OrdemServico {
  id: string;
  oficinaId: string;
  numero: number;
  clienteId: string;
  veiculoId: string;
  descricaoServico: string;
  pecasUsadas: { itemEstoqueId: string; quantidade: number }[];
  valor: number;
  status: OSStatus;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Cliente {
  id: string;
  oficinaId: string;
  nome: string;
  telefone: string;
  email: string;
  endereco: string;
}

export interface Veiculo {
  id: string;
  oficinaId: string;
  clienteId: string;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
}

export interface Fornecedor {
  id: string;
  oficinaId: string;
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
}

export type FormaPagamento =
  | "dinheiro"
  | "cartao_credito"
  | "cartao_debito"
  | "pix"
  | "boleto";

export const FORMAS_PAGAMENTO: Record<FormaPagamento, string> = {
  dinheiro: "Dinheiro",
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
  pix: "PIX",
  boleto: "Boleto",
};

export interface ContaReceber {
  id: string;
  oficinaId: string;
  clienteId: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  pago: boolean;
}

export interface ContaPagar {
  id: string;
  oficinaId: string;
  fornecedorId?: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  pago: boolean;
}

export interface CaixaDiario {
  id: string;
  oficinaId: string;
  tipo: "entrada" | "saida";
  descricao: string;
  valor: number;
  formaPagamento: FormaPagamento;
  data: string;
}

export type AssinaturaStatus = "pending" | "authorized" | "paused" | "cancelled";

export const ASSINATURA_STATUS_LABELS: Record<AssinaturaStatus, string> = {
  pending: "Pendente",
  authorized: "Ativa",
  paused: "Pausada",
  cancelled: "Cancelada",
};

export interface Assinatura {
  id: string;
  oficinaId: string;
  planoId: string;
  mpPreapprovalId?: string;
  mpInitPoint?: string;
  status: AssinaturaStatus;
  valor: number;
  dataInicio?: string;
  proximoPagamento?: string;
  ultimoPagamento?: string;
  createdAt: string;
  updatedAt: string;
}

export type PagamentoStatus = "approved" | "pending" | "rejected" | "refunded";

export const PAGAMENTO_STATUS_LABELS: Record<PagamentoStatus, string> = {
  approved: "Aprovado",
  pending: "Pendente",
  rejected: "Rejeitado",
  refunded: "Reembolsado",
};

export interface Pagamento {
  id: string;
  assinaturaId: string;
  oficinaId: string;
  mpPaymentId?: string;
  valor: number;
  status: PagamentoStatus;
  dataPagamento?: string;
  createdAt: string;
}
