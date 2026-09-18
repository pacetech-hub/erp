# Pace Seller — ERP

Monorepo (monólito modular) do Pace Seller.

- `apps/backend` — API NestJS (PostgreSQL via Prisma, autenticação via Supabase Auth)
- `apps/frontend` — SPA React (Vite, React Query, React Hook Form + Zod)

## Requisitos

- Node.js 22+
- PostgreSQL (local ou Azure Database for PostgreSQL)
- Um projeto Supabase (para Auth)

## Setup

```bash
npm install

# backend
cp apps/backend/.env.example apps/backend/.env
# preencha DATABASE_URL e SUPABASE_JWT_SECRET
npm run prisma:migrate --workspace apps/backend
npm run dev:backend

# frontend (em outro terminal)
cp apps/frontend/.env.example apps/frontend/.env
# preencha VITE_API_URL, VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
npm run dev:frontend
```

## Módulo: Cadastro de Clientes

CRUD de clientes (lojistas) do Pace Seller, hoje cadastrados diretamente no sistema
(sem integração com ERP externo).

- API: `apps/backend/src/modules/clientes`
- Telas: `apps/frontend/src/pages/clientes`

Endpoints: `GET /clientes`, `GET /clientes/:id`, `POST /clientes`, `PATCH /clientes/:id`,
`PATCH /clientes/:id/inativar`, `PATCH /clientes/:id/ativar`. Não há exclusão definitiva —
"excluir" um cliente apenas altera seu status para `inativo`, preservando o histórico de
pedidos e relatórios. Toda criação/edição registra autor e timestamp (`criadoPor`/`criadoEm`,
`atualizadoPor`/`atualizadoEm`).
