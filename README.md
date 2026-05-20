# macSaas.com.br

Sistema SaaS de Gestão para Oficinas Mecânicas, Funilarias e Pinturas.

## Stack

- **Frontend:** React 19 + Vite + TypeScript
- **UI:** Tailwind CSS 4 + shadcn/ui
- **Gráficos:** Recharts
- **Roteamento:** Wouter
- **Banco de Dados:** Supabase (PostgreSQL)

## Funcionalidades

- **Landing Page** com planos e apresentação
- **Super Admin** — gestão de oficinas, planos e relatórios consolidados
- **Admin da Oficina** — dashboard, receitas, despesas, estoque, ordens de serviço, cadastros, financeiro e relatórios
- **Multi-tenant** — cada oficina com dados isolados
- **WhatsApp** — compartilhar OS direto no WhatsApp do cliente
- **Impressão Térmica** — imprimir OS em impressora térmica 80mm
- **Funilaria & Pintura** — categorias específicas para estes serviços

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Credenciais (Super Admin)

- Email: `admin@mecanisaas.com`
- Senha: `admin123`

## Banco de Dados

O schema SQL para o Supabase está em `supabase-schema.sql`.
