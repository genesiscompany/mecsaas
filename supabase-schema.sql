-- =============================================
-- macSaas - Schema do Banco de Dados (Supabase/PostgreSQL)
-- =============================================

-- Extensão para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABELAS
-- =============================================

-- Planos
CREATE TABLE planos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL CHECK (nome IN ('Mensal', 'Trimestral', 'Anual')),
  valor NUMERIC(10,2) NOT NULL,
  periodicidade TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Oficinas
CREATE TABLE oficinas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  telefone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  endereco TEXT NOT NULL DEFAULT '',
  plano_id UUID REFERENCES planos(id),
  ativa BOOLEAN DEFAULT TRUE,
  admin_nome TEXT NOT NULL,
  admin_email TEXT NOT NULL UNIQUE,
  admin_senha TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Clientes
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oficina_id UUID NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  endereco TEXT NOT NULL DEFAULT '',
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Veículos
CREATE TABLE veiculos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oficina_id UUID NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  placa TEXT NOT NULL,
  modelo TEXT NOT NULL,
  marca TEXT NOT NULL,
  ano INTEGER NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Fornecedores
CREATE TABLE fornecedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oficina_id UUID NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cnpj TEXT NOT NULL DEFAULT '',
  telefone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Estoque
CREATE TABLE estoque (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oficina_id UUID NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('pneus','pecas','oleo','filtros','tintas','verniz','lixas','massas')),
  quantidade INTEGER NOT NULL DEFAULT 0,
  preco_unitario NUMERIC(10,2) NOT NULL DEFAULT 0,
  estoque_minimo INTEGER NOT NULL DEFAULT 5,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Receitas
CREATE TABLE receitas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oficina_id UUID NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('servicos','venda_pecas','venda_pneus','alinhamento','balanceamento','troca_oleo','funilaria','pintura','polimento','martelinho_ouro')),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  ordem_servico_id UUID,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Despesas
CREATE TABLE despesas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oficina_id UUID NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('compra_pecas','compra_pneus','funcionarios','aluguel','energia','agua_internet','impostos','ferramentas','materiais_pintura','lixas_abrasivos','massas_primers')),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Ordens de Serviço
CREATE TABLE ordens_servico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oficina_id UUID NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  veiculo_id UUID NOT NULL REFERENCES veiculos(id),
  descricao_servico TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta','em_andamento','concluida','cancelada')),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Peças usadas na OS (tabela relacional)
CREATE TABLE os_pecas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ordem_servico_id UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  item_estoque_id UUID NOT NULL REFERENCES estoque(id),
  quantidade INTEGER NOT NULL DEFAULT 1
);

-- Contas a Receber
CREATE TABLE contas_receber (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oficina_id UUID NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  descricao TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  pago BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Contas a Pagar
CREATE TABLE contas_pagar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oficina_id UUID NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
  fornecedor_id UUID REFERENCES fornecedores(id),
  descricao TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  pago BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Caixa Diário
CREATE TABLE caixa_diario (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oficina_id UUID NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  descricao TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  forma_pagamento TEXT NOT NULL CHECK (forma_pagamento IN ('dinheiro','cartao_credito','cartao_debito','pix','boleto')),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Contador de OS por oficina
CREATE TABLE os_counter (
  oficina_id UUID PRIMARY KEY REFERENCES oficinas(id) ON DELETE CASCADE,
  contador INTEGER NOT NULL DEFAULT 0
);

-- =============================================
-- ÍNDICES
-- =============================================

CREATE INDEX idx_clientes_oficina ON clientes(oficina_id);
CREATE INDEX idx_veiculos_oficina ON veiculos(oficina_id);
CREATE INDEX idx_veiculos_cliente ON veiculos(cliente_id);
CREATE INDEX idx_fornecedores_oficina ON fornecedores(oficina_id);
CREATE INDEX idx_estoque_oficina ON estoque(oficina_id);
CREATE INDEX idx_receitas_oficina ON receitas(oficina_id);
CREATE INDEX idx_receitas_data ON receitas(data);
CREATE INDEX idx_despesas_oficina ON despesas(oficina_id);
CREATE INDEX idx_despesas_data ON despesas(data);
CREATE INDEX idx_ordens_servico_oficina ON ordens_servico(oficina_id);
CREATE INDEX idx_os_pecas_os ON os_pecas(ordem_servico_id);
CREATE INDEX idx_contas_receber_oficina ON contas_receber(oficina_id);
CREATE INDEX idx_contas_pagar_oficina ON contas_pagar(oficina_id);
CREATE INDEX idx_caixa_diario_oficina ON caixa_diario(oficina_id);
CREATE INDEX idx_caixa_diario_data ON caixa_diario(data);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE oficinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE os_pecas ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_receber ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE caixa_diario ENABLE ROW LEVEL SECURITY;
ALTER TABLE os_counter ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos ENABLE ROW LEVEL SECURITY;

-- Política pública para leitura/escrita (via anon key com service_role para admin)
-- Em produção, refinaria com auth do Supabase
CREATE POLICY "Allow all on planos" ON planos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on oficinas" ON oficinas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on veiculos" ON veiculos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on fornecedores" ON fornecedores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on estoque" ON estoque FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on receitas" ON receitas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on despesas" ON despesas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on ordens_servico" ON ordens_servico FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on os_pecas" ON os_pecas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on contas_receber" ON contas_receber FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on contas_pagar" ON contas_pagar FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on caixa_diario" ON caixa_diario FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on os_counter" ON os_counter FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- DADOS INICIAIS
-- =============================================

INSERT INTO planos (id, nome, valor, periodicidade) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Mensal', 199.90, 'mensal'),
  ('00000000-0000-0000-0000-000000000002', 'Trimestral', 499.90, 'trimestral'),
  ('00000000-0000-0000-0000-000000000003', 'Anual', 1799.90, 'anual');
