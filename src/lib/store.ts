import { generateId } from "./utils";
import { supabase } from "./supabase";
import type {
  Oficina,
  Plano,
  Receita,
  Despesa,
  ItemEstoque,
  OrdemServico,
  Cliente,
  Veiculo,
  Fornecedor,
  ContaReceber,
  ContaPagar,
  CaixaDiario,
  User,
  Assinatura,
  Pagamento,
} from "./types";

// ==========================================
// In-memory cache synced with Supabase
// ==========================================

interface StoreData {
  users: User[];
  planos: Plano[];
  oficinas: Oficina[];
  receitas: Receita[];
  despesas: Despesa[];
  estoque: ItemEstoque[];
  ordensServico: OrdemServico[];
  clientes: Cliente[];
  veiculos: Veiculo[];
  fornecedores: Fornecedor[];
  contasReceber: ContaReceber[];
  contasPagar: ContaPagar[];
  caixaDiario: CaixaDiario[];
  assinaturas: Assinatura[];
  pagamentos: Pagamento[];
  osCounter: Record<string, number>;
  loaded: boolean;
}

const cache: StoreData = {
  users: [
    {
      id: "super-admin-1",
      name: "Super Admin",
      email: "admin@mecanisaas.com",
      role: "super_admin",
    },
  ],
  planos: [],
  oficinas: [],
  receitas: [],
  despesas: [],
  estoque: [],
  ordensServico: [],
  clientes: [],
  veiculos: [],
  fornecedores: [],
  contasReceber: [],
  contasPagar: [],
  caixaDiario: [],
  assinaturas: [],
  pagamentos: [],
  osCounter: {},
  loaded: false,
};

// Column mapping helpers (snake_case DB <-> camelCase TS)
function mapOficinaFromDb(row: Record<string, unknown>): Oficina {
  return {
    id: row.id as string,
    nome: row.nome as string,
    cnpj: row.cnpj as string,
    telefone: row.telefone as string,
    email: row.email as string,
    endereco: row.endereco as string,
    planoId: row.plano_id as string,
    ativa: row.ativa as boolean,
    criadoEm: row.criado_em as string,
    adminNome: row.admin_nome as string,
    adminEmail: row.admin_email as string,
    adminSenha: row.admin_senha as string,
  };
}

function mapReceitaFromDb(row: Record<string, unknown>): Receita {
  return {
    id: row.id as string,
    oficinaId: row.oficina_id as string,
    descricao: row.descricao as string,
    valor: Number(row.valor),
    categoria: row.categoria as Receita["categoria"],
    data: row.data as string,
    ordemServicoId: (row.ordem_servico_id as string) || undefined,
  };
}

function mapDespesaFromDb(row: Record<string, unknown>): Despesa {
  return {
    id: row.id as string,
    oficinaId: row.oficina_id as string,
    descricao: row.descricao as string,
    valor: Number(row.valor),
    categoria: row.categoria as Despesa["categoria"],
    data: row.data as string,
  };
}

function mapEstoqueFromDb(row: Record<string, unknown>): ItemEstoque {
  return {
    id: row.id as string,
    oficinaId: row.oficina_id as string,
    nome: row.nome as string,
    categoria: row.categoria as ItemEstoque["categoria"],
    quantidade: Number(row.quantidade),
    precoUnitario: Number(row.preco_unitario),
    estoqueMinimo: Number(row.estoque_minimo),
  };
}

function mapOSFromDb(
  row: Record<string, unknown>,
  pecas: { itemEstoqueId: string; quantidade: number }[],
): OrdemServico {
  return {
    id: row.id as string,
    oficinaId: row.oficina_id as string,
    numero: Number(row.numero),
    clienteId: row.cliente_id as string,
    veiculoId: row.veiculo_id as string,
    descricaoServico: row.descricao_servico as string,
    valor: Number(row.valor),
    status: row.status as OrdemServico["status"],
    criadoEm: row.criado_em as string,
    atualizadoEm: row.atualizado_em as string,
    pecasUsadas: pecas,
  };
}

function mapClienteFromDb(row: Record<string, unknown>): Cliente {
  return {
    id: row.id as string,
    oficinaId: row.oficina_id as string,
    nome: row.nome as string,
    telefone: row.telefone as string,
    email: row.email as string,
    endereco: row.endereco as string,
  };
}

function mapVeiculoFromDb(row: Record<string, unknown>): Veiculo {
  return {
    id: row.id as string,
    oficinaId: row.oficina_id as string,
    clienteId: row.cliente_id as string,
    placa: row.placa as string,
    modelo: row.modelo as string,
    marca: row.marca as string,
    ano: Number(row.ano),
  };
}

function mapFornecedorFromDb(row: Record<string, unknown>): Fornecedor {
  return {
    id: row.id as string,
    oficinaId: row.oficina_id as string,
    nome: row.nome as string,
    cnpj: row.cnpj as string,
    telefone: row.telefone as string,
    email: row.email as string,
  };
}

function mapContaReceberFromDb(row: Record<string, unknown>): ContaReceber {
  return {
    id: row.id as string,
    oficinaId: row.oficina_id as string,
    clienteId: row.cliente_id as string,
    descricao: row.descricao as string,
    valor: Number(row.valor),
    dataVencimento: row.data_vencimento as string,
    pago: row.pago as boolean,
  };
}

function mapContaPagarFromDb(row: Record<string, unknown>): ContaPagar {
  return {
    id: row.id as string,
    oficinaId: row.oficina_id as string,
    fornecedorId: (row.fornecedor_id as string) || undefined,
    descricao: row.descricao as string,
    valor: Number(row.valor),
    dataVencimento: row.data_vencimento as string,
    pago: row.pago as boolean,
  };
}

function mapCaixaDiarioFromDb(row: Record<string, unknown>): CaixaDiario {
  return {
    id: row.id as string,
    oficinaId: row.oficina_id as string,
    tipo: row.tipo as CaixaDiario["tipo"],
    descricao: row.descricao as string,
    valor: Number(row.valor),
    formaPagamento: row.forma_pagamento as CaixaDiario["formaPagamento"],
    data: row.data as string,
  };
}

function mapPlanoFromDb(row: Record<string, unknown>): Plano {
  return {
    id: row.id as string,
    nome: row.nome as Plano["nome"],
    valor: Number(row.valor),
    periodicidade: row.periodicidade as string,
  };
}

function mapAssinaturaFromDb(row: Record<string, unknown>): Assinatura {
  return {
    id: row.id as string,
    oficinaId: row.oficina_id as string,
    planoId: row.plano_id as string,
    mpPreapprovalId: (row.mp_preapproval_id as string) || undefined,
    mpInitPoint: (row.mp_init_point as string) || undefined,
    status: row.status as Assinatura["status"],
    valor: Number(row.valor),
    dataInicio: (row.data_inicio as string) || undefined,
    proximoPagamento: (row.proximo_pagamento as string) || undefined,
    ultimoPagamento: (row.ultimo_pagamento as string) || undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapPagamentoFromDb(row: Record<string, unknown>): Pagamento {
  return {
    id: row.id as string,
    assinaturaId: row.assinatura_id as string,
    oficinaId: row.oficina_id as string,
    mpPaymentId: (row.mp_payment_id as string) || undefined,
    valor: Number(row.valor),
    status: row.status as Pagamento["status"],
    dataPagamento: (row.data_pagamento as string) || undefined,
    createdAt: row.created_at as string,
  };
}

// ==========================================
// Load all data from Supabase into cache
// ==========================================

let loadPromise: Promise<void> | null = null;

export async function loadAllData(): Promise<void> {
  if (cache.loaded) return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const [
      planosRes,
      oficinasRes,
      receitasRes,
      despesasRes,
      estoqueRes,
      osRes,
      osPecasRes,
      clientesRes,
      veiculosRes,
      fornecedoresRes,
      contasReceberRes,
      contasPagarRes,
      caixaDiarioRes,
      osCounterRes,
    ] = await Promise.all([
      supabase.from("planos").select("*"),
      supabase.from("oficinas").select("*"),
      supabase.from("receitas").select("*"),
      supabase.from("despesas").select("*"),
      supabase.from("estoque").select("*"),
      supabase.from("ordens_servico").select("*"),
      supabase.from("os_pecas").select("*"),
      supabase.from("clientes").select("*"),
      supabase.from("veiculos").select("*"),
      supabase.from("fornecedores").select("*"),
      supabase.from("contas_receber").select("*"),
      supabase.from("contas_pagar").select("*"),
      supabase.from("caixa_diario").select("*"),
      supabase.from("os_counter").select("*"),
    ]);

    cache.planos = (planosRes.data ?? []).map(mapPlanoFromDb);
    cache.oficinas = (oficinasRes.data ?? []).map(mapOficinaFromDb);
    cache.receitas = (receitasRes.data ?? []).map(mapReceitaFromDb);
    cache.despesas = (despesasRes.data ?? []).map(mapDespesaFromDb);
    cache.estoque = (estoqueRes.data ?? []).map(mapEstoqueFromDb);
    cache.clientes = (clientesRes.data ?? []).map(mapClienteFromDb);
    cache.veiculos = (veiculosRes.data ?? []).map(mapVeiculoFromDb);
    cache.fornecedores = (fornecedoresRes.data ?? []).map(mapFornecedorFromDb);
    cache.contasReceber = (contasReceberRes.data ?? []).map(mapContaReceberFromDb);
    cache.contasPagar = (contasPagarRes.data ?? []).map(mapContaPagarFromDb);
    cache.caixaDiario = (caixaDiarioRes.data ?? []).map(mapCaixaDiarioFromDb);

    // Load assinaturas and pagamentos
    const [assinaturasRes, pagamentosRes] = await Promise.all([
      supabase.from("assinaturas").select("*"),
      supabase.from("pagamentos").select("*"),
    ]);
    cache.assinaturas = (assinaturasRes.data ?? []).map(mapAssinaturaFromDb);
    cache.pagamentos = (pagamentosRes.data ?? []).map(mapPagamentoFromDb);

    // Build pecas map
    const pecasMap: Record<string, { itemEstoqueId: string; quantidade: number }[]> = {};
    for (const p of osPecasRes.data ?? []) {
      const osId = p.ordem_servico_id as string;
      if (!pecasMap[osId]) pecasMap[osId] = [];
      pecasMap[osId].push({
        itemEstoqueId: p.item_estoque_id as string,
        quantidade: Number(p.quantidade),
      });
    }

    cache.ordensServico = (osRes.data ?? []).map((row) =>
      mapOSFromDb(row, pecasMap[row.id as string] ?? []),
    );

    // Build OS counter
    cache.osCounter = {};
    for (const c of osCounterRes.data ?? []) {
      cache.osCounter[c.oficina_id as string] = Number(c.contador);
    }

    cache.loaded = true;
  })();

  return loadPromise;
}

export function isDataLoaded(): boolean {
  return cache.loaded;
}

// ==========================================
// Users / Auth
// ==========================================

export function getUsers(): User[] {
  return cache.users;
}

export function authenticateUser(
  email: string,
  senha: string,
): { user: User | null; error?: string } {
  if (email === "admin@mecanisaas.com" && senha === "admin123") {
    return { user: cache.users.find((u) => u.role === "super_admin") ?? null };
  }
  const oficina = cache.oficinas.find(
    (o) => o.adminEmail === email && o.adminSenha === senha,
  );
  if (oficina) {
    if (!oficina.ativa) {
      return { user: null, error: "Assinatura vencida ou oficina desativada. Entre em contato com o suporte." };
    }
    return {
      user: {
        id: `oficina-user-${oficina.id}`,
        name: oficina.adminNome,
        email: oficina.adminEmail,
        role: "oficina_admin",
        oficinaId: oficina.id,
      },
    };
  }
  return { user: null, error: "Email ou senha inválidos" };
}

// ==========================================
// Planos
// ==========================================

export function getPlanos(): Plano[] {
  return cache.planos;
}

export function updatePlano(id: string, updates: Partial<Plano>): void {
  const idx = cache.planos.findIndex((p) => p.id === id);
  if (idx >= 0) {
    cache.planos[idx] = { ...cache.planos[idx], ...updates };
    const dbUpdates: Record<string, unknown> = {};
    if (updates.valor !== undefined) dbUpdates.valor = updates.valor;
    if (updates.nome !== undefined) dbUpdates.nome = updates.nome;
    if (updates.periodicidade !== undefined) dbUpdates.periodicidade = updates.periodicidade;
    supabase.from("planos").update(dbUpdates).eq("id", id).then();
  }
}

// ==========================================
// Oficinas
// ==========================================

export function getOficinas(): Oficina[] {
  return cache.oficinas;
}

export function getOficina(id: string): Oficina | undefined {
  return cache.oficinas.find((o) => o.id === id);
}

export function createOficina(oficina: Omit<Oficina, "id" | "criadoEm">): Oficina {
  const id = generateId();
  const now = new Date().toISOString();
  const newOficina: Oficina = { ...oficina, id, criadoEm: now };
  cache.oficinas.push(newOficina);
  supabase
    .from("oficinas")
    .insert({
      id,
      nome: oficina.nome,
      cnpj: oficina.cnpj,
      telefone: oficina.telefone,
      email: oficina.email,
      endereco: oficina.endereco,
      plano_id: oficina.planoId,
      ativa: oficina.ativa,
      admin_nome: oficina.adminNome,
      admin_email: oficina.adminEmail,
      admin_senha: oficina.adminSenha,
    })
    .then();
  return newOficina;
}

export function updateOficina(id: string, updates: Partial<Oficina>): void {
  const idx = cache.oficinas.findIndex((o) => o.id === id);
  if (idx >= 0) {
    cache.oficinas[idx] = { ...cache.oficinas[idx], ...updates };
    const dbUpdates: Record<string, unknown> = {};
    if (updates.nome !== undefined) dbUpdates.nome = updates.nome;
    if (updates.cnpj !== undefined) dbUpdates.cnpj = updates.cnpj;
    if (updates.telefone !== undefined) dbUpdates.telefone = updates.telefone;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.endereco !== undefined) dbUpdates.endereco = updates.endereco;
    if (updates.planoId !== undefined) dbUpdates.plano_id = updates.planoId;
    if (updates.ativa !== undefined) dbUpdates.ativa = updates.ativa;
    if (updates.adminNome !== undefined) dbUpdates.admin_nome = updates.adminNome;
    if (updates.adminEmail !== undefined) dbUpdates.admin_email = updates.adminEmail;
    if (updates.adminSenha !== undefined) dbUpdates.admin_senha = updates.adminSenha;
    supabase.from("oficinas").update(dbUpdates).eq("id", id).then();
  }
}

export function toggleOficinaStatus(id: string): void {
  const idx = cache.oficinas.findIndex((o) => o.id === id);
  if (idx >= 0) {
    cache.oficinas[idx].ativa = !cache.oficinas[idx].ativa;
    supabase
      .from("oficinas")
      .update({ ativa: cache.oficinas[idx].ativa })
      .eq("id", id)
      .then();
  }
}

// ==========================================
// Receitas
// ==========================================

export function getReceitas(oficinaId: string): Receita[] {
  return cache.receitas.filter((r) => r.oficinaId === oficinaId);
}

export function getAllReceitas(): Receita[] {
  return cache.receitas;
}

export function createReceita(receita: Omit<Receita, "id">): Receita {
  const id = generateId();
  const newReceita: Receita = { ...receita, id };
  cache.receitas.push(newReceita);
  supabase
    .from("receitas")
    .insert({
      id,
      oficina_id: receita.oficinaId,
      descricao: receita.descricao,
      valor: receita.valor,
      categoria: receita.categoria,
      data: receita.data,
      ordem_servico_id: receita.ordemServicoId || null,
    })
    .then();
  return newReceita;
}

export function updateReceita(id: string, updates: Partial<Receita>): void {
  const idx = cache.receitas.findIndex((r) => r.id === id);
  if (idx >= 0) {
    cache.receitas[idx] = { ...cache.receitas[idx], ...updates };
    const dbUpdates: Record<string, unknown> = {};
    if (updates.descricao !== undefined) dbUpdates.descricao = updates.descricao;
    if (updates.valor !== undefined) dbUpdates.valor = updates.valor;
    if (updates.categoria !== undefined) dbUpdates.categoria = updates.categoria;
    if (updates.data !== undefined) dbUpdates.data = updates.data;
    supabase.from("receitas").update(dbUpdates).eq("id", id).then();
  }
}

export function deleteReceita(id: string): void {
  cache.receitas = cache.receitas.filter((r) => r.id !== id);
  supabase.from("receitas").delete().eq("id", id).then();
}

// ==========================================
// Despesas
// ==========================================

export function getDespesas(oficinaId: string): Despesa[] {
  return cache.despesas.filter((d) => d.oficinaId === oficinaId);
}

export function getAllDespesas(): Despesa[] {
  return cache.despesas;
}

export function createDespesa(despesa: Omit<Despesa, "id">): Despesa {
  const id = generateId();
  const newDespesa: Despesa = { ...despesa, id };
  cache.despesas.push(newDespesa);
  supabase
    .from("despesas")
    .insert({
      id,
      oficina_id: despesa.oficinaId,
      descricao: despesa.descricao,
      valor: despesa.valor,
      categoria: despesa.categoria,
      data: despesa.data,
    })
    .then();
  return newDespesa;
}

export function updateDespesa(id: string, updates: Partial<Despesa>): void {
  const idx = cache.despesas.findIndex((d) => d.id === id);
  if (idx >= 0) {
    cache.despesas[idx] = { ...cache.despesas[idx], ...updates };
    const dbUpdates: Record<string, unknown> = {};
    if (updates.descricao !== undefined) dbUpdates.descricao = updates.descricao;
    if (updates.valor !== undefined) dbUpdates.valor = updates.valor;
    if (updates.categoria !== undefined) dbUpdates.categoria = updates.categoria;
    if (updates.data !== undefined) dbUpdates.data = updates.data;
    supabase.from("despesas").update(dbUpdates).eq("id", id).then();
  }
}

export function deleteDespesa(id: string): void {
  cache.despesas = cache.despesas.filter((d) => d.id !== id);
  supabase.from("despesas").delete().eq("id", id).then();
}

// ==========================================
// Estoque
// ==========================================

export function getEstoque(oficinaId: string): ItemEstoque[] {
  return cache.estoque.filter((e) => e.oficinaId === oficinaId);
}

export function createItemEstoque(item: Omit<ItemEstoque, "id">): ItemEstoque {
  const id = generateId();
  const newItem: ItemEstoque = { ...item, id };
  cache.estoque.push(newItem);
  supabase
    .from("estoque")
    .insert({
      id,
      oficina_id: item.oficinaId,
      nome: item.nome,
      categoria: item.categoria,
      quantidade: item.quantidade,
      preco_unitario: item.precoUnitario,
      estoque_minimo: item.estoqueMinimo,
    })
    .then();
  return newItem;
}

export function updateItemEstoque(id: string, updates: Partial<ItemEstoque>): void {
  const idx = cache.estoque.findIndex((e) => e.id === id);
  if (idx >= 0) {
    cache.estoque[idx] = { ...cache.estoque[idx], ...updates };
    const dbUpdates: Record<string, unknown> = {};
    if (updates.nome !== undefined) dbUpdates.nome = updates.nome;
    if (updates.categoria !== undefined) dbUpdates.categoria = updates.categoria;
    if (updates.quantidade !== undefined) dbUpdates.quantidade = updates.quantidade;
    if (updates.precoUnitario !== undefined) dbUpdates.preco_unitario = updates.precoUnitario;
    if (updates.estoqueMinimo !== undefined) dbUpdates.estoque_minimo = updates.estoqueMinimo;
    supabase.from("estoque").update(dbUpdates).eq("id", id).then();
  }
}

export function deleteItemEstoque(id: string): boolean {
  const inUse = cache.ordensServico.some(
    (os) =>
      os.status !== "cancelada" &&
      os.pecasUsadas.some((p) => p.itemEstoqueId === id),
  );
  if (inUse) return false;
  cache.estoque = cache.estoque.filter((e) => e.id !== id);
  supabase.from("estoque").delete().eq("id", id).then();
  return true;
}

export function ajustarEstoque(id: string, delta: number): void {
  const idx = cache.estoque.findIndex((e) => e.id === id);
  if (idx >= 0) {
    cache.estoque[idx].quantidade = Math.max(0, cache.estoque[idx].quantidade + delta);
    supabase
      .from("estoque")
      .update({ quantidade: cache.estoque[idx].quantidade })
      .eq("id", id)
      .then();
  }
}

// ==========================================
// Ordens de Serviço
// ==========================================

export function getOrdensServico(oficinaId: string): OrdemServico[] {
  return cache.ordensServico.filter((os) => os.oficinaId === oficinaId);
}

export function getAllOrdensServico(): OrdemServico[] {
  return cache.ordensServico;
}

export function createOrdemServico(
  os: Omit<OrdemServico, "id" | "numero" | "criadoEm" | "atualizadoEm">,
): OrdemServico {
  const counter = (cache.osCounter[os.oficinaId] ?? 0) + 1;
  cache.osCounter[os.oficinaId] = counter;
  const now = new Date().toISOString();
  const id = generateId();
  const newOS: OrdemServico = {
    ...os,
    id,
    numero: counter,
    criadoEm: now,
    atualizadoEm: now,
  };
  cache.ordensServico.push(newOS);

  // Insert OS
  supabase
    .from("ordens_servico")
    .insert({
      id,
      oficina_id: os.oficinaId,
      numero: counter,
      cliente_id: os.clienteId,
      veiculo_id: os.veiculoId,
      descricao_servico: os.descricaoServico,
      valor: os.valor,
      status: os.status,
    })
    .then();

  // Insert pecas
  if (os.pecasUsadas.length > 0) {
    supabase
      .from("os_pecas")
      .insert(
        os.pecasUsadas.map((p) => ({
          ordem_servico_id: id,
          item_estoque_id: p.itemEstoqueId,
          quantidade: p.quantidade,
        })),
      )
      .then();
  }

  // Upsert counter
  supabase
    .from("os_counter")
    .upsert({ oficina_id: os.oficinaId, contador: counter })
    .then();

  return newOS;
}

export function updateOrdemServico(id: string, updates: Partial<OrdemServico>): void {
  const idx = cache.ordensServico.findIndex((os) => os.id === id);
  if (idx >= 0) {
    cache.ordensServico[idx] = {
      ...cache.ordensServico[idx],
      ...updates,
      atualizadoEm: new Date().toISOString(),
    };
    const dbUpdates: Record<string, unknown> = { atualizado_em: new Date().toISOString() };
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.descricaoServico !== undefined) dbUpdates.descricao_servico = updates.descricaoServico;
    if (updates.valor !== undefined) dbUpdates.valor = updates.valor;
    supabase.from("ordens_servico").update(dbUpdates).eq("id", id).then();
  }
}

export function concluirOrdemServico(id: string): void {
  const idx = cache.ordensServico.findIndex((os) => os.id === id);
  if (idx < 0) return;
  const os = cache.ordensServico[idx];
  os.status = "concluida";
  os.atualizadoEm = new Date().toISOString();

  // Update OS status in DB
  supabase
    .from("ordens_servico")
    .update({ status: "concluida", atualizado_em: os.atualizadoEm })
    .eq("id", id)
    .then();

  // Auto-create receita
  const receitaId = generateId();
  const receitaData = {
    id: receitaId,
    oficinaId: os.oficinaId,
    descricao: `OS #${os.numero} - ${os.descricaoServico}`,
    valor: os.valor,
    categoria: "servicos" as const,
    data: new Date().toISOString().split("T")[0],
    ordemServicoId: os.id,
  };
  cache.receitas.push(receitaData);
  supabase
    .from("receitas")
    .insert({
      id: receitaId,
      oficina_id: os.oficinaId,
      descricao: receitaData.descricao,
      valor: os.valor,
      categoria: "servicos",
      data: receitaData.data,
      ordem_servico_id: os.id,
    })
    .then();

  // Auto-update estoque
  for (const peca of os.pecasUsadas) {
    const estoqueIdx = cache.estoque.findIndex((e) => e.id === peca.itemEstoqueId);
    if (estoqueIdx >= 0) {
      cache.estoque[estoqueIdx].quantidade = Math.max(
        0,
        cache.estoque[estoqueIdx].quantidade - peca.quantidade,
      );
      supabase
        .from("estoque")
        .update({ quantidade: cache.estoque[estoqueIdx].quantidade })
        .eq("id", peca.itemEstoqueId)
        .then();
    }
  }

  // Auto-register in caixa diário
  const caixaId = generateId();
  const caixaEntry: CaixaDiario = {
    id: caixaId,
    oficinaId: os.oficinaId,
    tipo: "entrada",
    descricao: `OS #${os.numero} concluída`,
    valor: os.valor,
    formaPagamento: "dinheiro",
    data: new Date().toISOString().split("T")[0],
  };
  cache.caixaDiario.push(caixaEntry);
  supabase
    .from("caixa_diario")
    .insert({
      id: caixaId,
      oficina_id: os.oficinaId,
      tipo: "entrada",
      descricao: caixaEntry.descricao,
      valor: os.valor,
      forma_pagamento: "dinheiro",
      data: caixaEntry.data,
    })
    .then();
}

// ==========================================
// Clientes
// ==========================================

export function getClientes(oficinaId: string): Cliente[] {
  return cache.clientes.filter((c) => c.oficinaId === oficinaId);
}

export function getAllClientes(): Cliente[] {
  return cache.clientes;
}

export function createCliente(cliente: Omit<Cliente, "id">): Cliente {
  const id = generateId();
  const newCliente: Cliente = { ...cliente, id };
  cache.clientes.push(newCliente);
  supabase
    .from("clientes")
    .insert({
      id,
      oficina_id: cliente.oficinaId,
      nome: cliente.nome,
      telefone: cliente.telefone,
      email: cliente.email,
      endereco: cliente.endereco,
    })
    .then();
  return newCliente;
}

export function updateCliente(id: string, updates: Partial<Cliente>): void {
  const idx = cache.clientes.findIndex((c) => c.id === id);
  if (idx >= 0) {
    cache.clientes[idx] = { ...cache.clientes[idx], ...updates };
    const dbUpdates: Record<string, unknown> = {};
    if (updates.nome !== undefined) dbUpdates.nome = updates.nome;
    if (updates.telefone !== undefined) dbUpdates.telefone = updates.telefone;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.endereco !== undefined) dbUpdates.endereco = updates.endereco;
    supabase.from("clientes").update(dbUpdates).eq("id", id).then();
  }
}

export function deleteCliente(id: string): boolean {
  const inUse = cache.ordensServico.some((os) => os.clienteId === id);
  if (inUse) return false;
  cache.clientes = cache.clientes.filter((c) => c.id !== id);
  supabase.from("clientes").delete().eq("id", id).then();
  return true;
}

// ==========================================
// Veículos
// ==========================================

export function getVeiculos(oficinaId: string): Veiculo[] {
  return cache.veiculos.filter((v) => v.oficinaId === oficinaId);
}

export function getAllVeiculos(): Veiculo[] {
  return cache.veiculos;
}

export function createVeiculo(veiculo: Omit<Veiculo, "id">): Veiculo {
  const id = generateId();
  const newVeiculo: Veiculo = { ...veiculo, id };
  cache.veiculos.push(newVeiculo);
  supabase
    .from("veiculos")
    .insert({
      id,
      oficina_id: veiculo.oficinaId,
      cliente_id: veiculo.clienteId,
      placa: veiculo.placa,
      modelo: veiculo.modelo,
      marca: veiculo.marca,
      ano: veiculo.ano,
    })
    .then();
  return newVeiculo;
}

export function updateVeiculo(id: string, updates: Partial<Veiculo>): void {
  const idx = cache.veiculos.findIndex((v) => v.id === id);
  if (idx >= 0) {
    cache.veiculos[idx] = { ...cache.veiculos[idx], ...updates };
    const dbUpdates: Record<string, unknown> = {};
    if (updates.placa !== undefined) dbUpdates.placa = updates.placa;
    if (updates.modelo !== undefined) dbUpdates.modelo = updates.modelo;
    if (updates.marca !== undefined) dbUpdates.marca = updates.marca;
    if (updates.ano !== undefined) dbUpdates.ano = updates.ano;
    if (updates.clienteId !== undefined) dbUpdates.cliente_id = updates.clienteId;
    supabase.from("veiculos").update(dbUpdates).eq("id", id).then();
  }
}

export function deleteVeiculo(id: string): boolean {
  const inUse = cache.ordensServico.some((os) => os.veiculoId === id);
  if (inUse) return false;
  cache.veiculos = cache.veiculos.filter((v) => v.id !== id);
  supabase.from("veiculos").delete().eq("id", id).then();
  return true;
}

// ==========================================
// Fornecedores
// ==========================================

export function getFornecedores(oficinaId: string): Fornecedor[] {
  return cache.fornecedores.filter((f) => f.oficinaId === oficinaId);
}

export function getAllFornecedores(): Fornecedor[] {
  return cache.fornecedores;
}

export function createFornecedor(fornecedor: Omit<Fornecedor, "id">): Fornecedor {
  const id = generateId();
  const newFornecedor: Fornecedor = { ...fornecedor, id };
  cache.fornecedores.push(newFornecedor);
  supabase
    .from("fornecedores")
    .insert({
      id,
      oficina_id: fornecedor.oficinaId,
      nome: fornecedor.nome,
      cnpj: fornecedor.cnpj,
      telefone: fornecedor.telefone,
      email: fornecedor.email,
    })
    .then();
  return newFornecedor;
}

export function updateFornecedor(id: string, updates: Partial<Fornecedor>): void {
  const idx = cache.fornecedores.findIndex((f) => f.id === id);
  if (idx >= 0) {
    cache.fornecedores[idx] = { ...cache.fornecedores[idx], ...updates };
    const dbUpdates: Record<string, unknown> = {};
    if (updates.nome !== undefined) dbUpdates.nome = updates.nome;
    if (updates.cnpj !== undefined) dbUpdates.cnpj = updates.cnpj;
    if (updates.telefone !== undefined) dbUpdates.telefone = updates.telefone;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    supabase.from("fornecedores").update(dbUpdates).eq("id", id).then();
  }
}

export function deleteFornecedor(id: string): boolean {
  const inUse = cache.contasPagar.some((cp) => cp.fornecedorId === id);
  if (inUse) return false;
  cache.fornecedores = cache.fornecedores.filter((f) => f.id !== id);
  supabase.from("fornecedores").delete().eq("id", id).then();
  return true;
}

// ==========================================
// Contas a Receber
// ==========================================

export function getContasReceber(oficinaId: string): ContaReceber[] {
  return cache.contasReceber.filter((cr) => cr.oficinaId === oficinaId);
}

export function createContaReceber(conta: Omit<ContaReceber, "id">): ContaReceber {
  const id = generateId();
  const newConta: ContaReceber = { ...conta, id };
  cache.contasReceber.push(newConta);
  supabase
    .from("contas_receber")
    .insert({
      id,
      oficina_id: conta.oficinaId,
      cliente_id: conta.clienteId,
      descricao: conta.descricao,
      valor: conta.valor,
      data_vencimento: conta.dataVencimento,
      pago: conta.pago,
    })
    .then();
  return newConta;
}

export function updateContaReceber(id: string, updates: Partial<ContaReceber>): void {
  const idx = cache.contasReceber.findIndex((cr) => cr.id === id);
  if (idx >= 0) {
    cache.contasReceber[idx] = { ...cache.contasReceber[idx], ...updates };
    const dbUpdates: Record<string, unknown> = {};
    if (updates.descricao !== undefined) dbUpdates.descricao = updates.descricao;
    if (updates.valor !== undefined) dbUpdates.valor = updates.valor;
    if (updates.dataVencimento !== undefined) dbUpdates.data_vencimento = updates.dataVencimento;
    if (updates.pago !== undefined) dbUpdates.pago = updates.pago;
    supabase.from("contas_receber").update(dbUpdates).eq("id", id).then();
  }
}

// ==========================================
// Contas a Pagar
// ==========================================

export function getContasPagar(oficinaId: string): ContaPagar[] {
  return cache.contasPagar.filter((cp) => cp.oficinaId === oficinaId);
}

export function createContaPagar(conta: Omit<ContaPagar, "id">): ContaPagar {
  const id = generateId();
  const newConta: ContaPagar = { ...conta, id };
  cache.contasPagar.push(newConta);
  supabase
    .from("contas_pagar")
    .insert({
      id,
      oficina_id: conta.oficinaId,
      fornecedor_id: conta.fornecedorId || null,
      descricao: conta.descricao,
      valor: conta.valor,
      data_vencimento: conta.dataVencimento,
      pago: conta.pago,
    })
    .then();
  return newConta;
}

export function updateContaPagar(id: string, updates: Partial<ContaPagar>): void {
  const idx = cache.contasPagar.findIndex((cp) => cp.id === id);
  if (idx >= 0) {
    cache.contasPagar[idx] = { ...cache.contasPagar[idx], ...updates };
    const dbUpdates: Record<string, unknown> = {};
    if (updates.descricao !== undefined) dbUpdates.descricao = updates.descricao;
    if (updates.valor !== undefined) dbUpdates.valor = updates.valor;
    if (updates.dataVencimento !== undefined) dbUpdates.data_vencimento = updates.dataVencimento;
    if (updates.pago !== undefined) dbUpdates.pago = updates.pago;
    supabase.from("contas_pagar").update(dbUpdates).eq("id", id).then();
  }
}

// ==========================================
// Caixa Diário
// ==========================================

export function getCaixaDiario(oficinaId: string, data?: string): CaixaDiario[] {
  const items = cache.caixaDiario.filter((c) => c.oficinaId === oficinaId);
  if (data) return items.filter((c) => c.data === data);
  return items;
}

export function createCaixaDiario(entry: Omit<CaixaDiario, "id">): CaixaDiario {
  const id = generateId();
  const newEntry: CaixaDiario = { ...entry, id };
  cache.caixaDiario.push(newEntry);
  supabase
    .from("caixa_diario")
    .insert({
      id,
      oficina_id: entry.oficinaId,
      tipo: entry.tipo,
      descricao: entry.descricao,
      valor: entry.valor,
      forma_pagamento: entry.formaPagamento,
      data: entry.data,
    })
    .then();
  return newEntry;
}

// ==========================================
// Super Admin stats
// ==========================================

export function getSuperAdminStats() {
  const totalOficinas = cache.oficinas.filter((o) => o.ativa).length;
  const totalReceitas = cache.receitas.reduce((sum, r) => sum + r.valor, 0);
  const totalClientes = cache.clientes.length;
  const totalVeiculos = cache.veiculos.length;
  const totalFornecedores = cache.fornecedores.length;
  const planoDistribuicao = cache.planos.map((p) => ({
    nome: p.nome,
    count: cache.oficinas.filter((o) => o.planoId === p.id && o.ativa).length,
  }));
  return {
    totalOficinas,
    totalReceitas,
    totalClientes,
    totalVeiculos,
    totalFornecedores,
    planoDistribuicao,
  };
}

export function getOficinaDashboardStats(oficinaId: string) {
  const now = new Date();
  const mesAtual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const receitasMes = cache.receitas
    .filter((r) => r.oficinaId === oficinaId && r.data.startsWith(mesAtual))
    .reduce((sum, r) => sum + r.valor, 0);

  const despesasMes = cache.despesas
    .filter((d) => d.oficinaId === oficinaId && d.data.startsWith(mesAtual))
    .reduce((sum, d) => sum + d.valor, 0);

  const osEmAndamento = cache.ordensServico.filter(
    (os) =>
      os.oficinaId === oficinaId &&
      (os.status === "aberta" || os.status === "em_andamento"),
  ).length;

  return {
    receitasMes,
    despesasMes,
    saldo: receitasMes - despesasMes,
    osEmAndamento,
  };
}

// ==========================================
// Assinaturas
// ==========================================

export function getAssinaturas(): Assinatura[] {
  return cache.assinaturas;
}

export function getAssinaturasOficina(oficinaId: string): Assinatura[] {
  return cache.assinaturas.filter((a) => a.oficinaId === oficinaId);
}

export function getAssinaturaAtiva(oficinaId: string): Assinatura | undefined {
  return cache.assinaturas.find(
    (a) => a.oficinaId === oficinaId && (a.status === "authorized" || a.status === "pending"),
  );
}

export function addAssinaturaToCache(assinatura: Assinatura): void {
  cache.assinaturas.push(assinatura);
}

export function updateAssinaturaInCache(id: string, updates: Partial<Assinatura>): void {
  const idx = cache.assinaturas.findIndex((a) => a.id === id);
  if (idx >= 0) {
    cache.assinaturas[idx] = { ...cache.assinaturas[idx], ...updates };
  }
}

export async function reloadAssinaturas(): Promise<void> {
  const { data } = await supabase.from("assinaturas").select("*");
  cache.assinaturas = (data ?? []).map(mapAssinaturaFromDb);
}

// ==========================================
// Pagamentos
// ==========================================

export function getPagamentos(): Pagamento[] {
  return cache.pagamentos;
}

export function getPagamentosOficina(oficinaId: string): Pagamento[] {
  return cache.pagamentos.filter((p) => p.oficinaId === oficinaId);
}

export function getPagamentosAssinatura(assinaturaId: string): Pagamento[] {
  return cache.pagamentos.filter((p) => p.assinaturaId === assinaturaId);
}
