# Finding 012

## Área
Deploy / browser — CORS e Helmet

## Código/Fluxo analisado
`src/app.ts` — superfície HTTP consumida por dashboard no browser.

## Problema identificado
Sem CORS, o browser bloqueia o front (origem diferente da API). Sem Helmet, faltam headers HTTP básicos de hardening.

## Como o problema poderia acontecer
1. Front em `localhost:5173` chama API em `:3000` → preflight/bloqueio CORS.
2. Clickjacking / MIME sniffing sem headers defensivos.

## Risco
Dashboard inutilizável no browser; superfície HTTP sem defaults modernos. OWASP **A05**.

## Mitigação estudada
- `CORS_ORIGIN` no env (origem explícita; sem var → CORS desligado).
- `helmet()` com defaults.
- Sem `Access-Control-Allow-Origin: *` em produção com credentials.

## Correção implementada
- `cors` + `helmet` em `app.ts`.
- `.env.example` documenta `CORS_ORIGIN`.

## Como validei
Login + `GET /auth/me` 200; header `Content-Security-Policy` / `X-Content-Type-Options` presentes via Helmet; `Access-Control-Allow-Origin` quando `CORS_ORIGIN` setado.

## Status
Corrigido (ciclo 7).
