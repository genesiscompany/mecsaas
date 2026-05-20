-- =============================================
-- Migration: Assinaturas e Pagamentos (Mercado Pago)
-- =============================================

-- Tabela de assinaturas (subscriptions)
CREATE TABLE IF NOT EXISTS assinaturas (
  id TEXT PRIMARY KEY,
  oficina_id TEXT NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
  plano_id TEXT NOT NULL REFERENCES planos(id),
  mp_preapproval_id TEXT,
  mp_init_point TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  valor NUMERIC(10,2) NOT NULL,
  data_inicio TIMESTAMP WITH TIME ZONE,
  proximo_pagamento TIMESTAMP WITH TIME ZONE,
  ultimo_pagamento TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pagamentos (payment history)
CREATE TABLE IF NOT EXISTS pagamentos (
  id TEXT PRIMARY KEY,
  assinatura_id TEXT NOT NULL REFERENCES assinaturas(id) ON DELETE CASCADE,
  oficina_id TEXT NOT NULL REFERENCES oficinas(id),
  mp_payment_id TEXT,
  valor NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  data_pagamento TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE assinaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for now — adjust later for proper tenant isolation)
CREATE POLICY "Allow all for assinaturas" ON assinaturas FOR ALL USING (true);
CREATE POLICY "Allow all for pagamentos" ON pagamentos FOR ALL USING (true);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_assinaturas_oficina ON assinaturas(oficina_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_status ON assinaturas(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_assinatura ON pagamentos(assinatura_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_oficina ON pagamentos(oficina_id);
