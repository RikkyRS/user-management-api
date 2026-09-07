# Frontend CRM (MVP fase 1)

Next.js App Router + TypeScript + Tailwind. Consome a API em `:3000`.

## Subir

Na raiz do monorepo (API):

```bash
npm run dev
```

No front:

```bash
cd web
cp .env.example .env.local
npm run dev
```

Abre [http://localhost:3001](http://localhost:3001).

No `.env` da API: `CORS_ORIGIN="http://localhost:3001"`.

## Telas

- `/login` — e-mail/senha (+ escolha de empresa se 409 ou CRM_OWNER sem tenant)
- `/dashboard` — cards NOVO / EM_ATENDIMENTO / QUALIFICADO / CLIENTE
- `/leads` — lista
- `/leads/[id]` — detalhe

Token JWT em cookie HttpOnly (`crm_session`) com `credentials: 'include'`. Sem Kanban, conversas ou IA nesta fase.
