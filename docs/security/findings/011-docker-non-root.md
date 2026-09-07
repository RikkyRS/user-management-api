# Finding 011

## Área
Deploy — container rodando como root

## Código/Fluxo analisado
`Dockerfile` runtime stage.

## Problema identificado
Processo da API herdava root no container → blast radius maior em RCE.

## Como o problema poderia acontecer
Compromisso da app → execução como root no filesystem do container.

## Risco
Privilege escalation pós-compromisso. OWASP **A05**.

## Mitigação estudada
`USER node` + `chown`; `HEALTHCHECK` em `GET /health`.

## Correção implementada
- `RUN chown -R node:node /app` + `USER node`.
- `HEALTHCHECK` com `fetch` nativo do Node em `/health`.

## Como validei
Inspeção do `Dockerfile` (stage runtime). Build de imagem / `whoami` fica para deploy local se Docker disponível.

## Status
Corrigido no código (ciclo 6); confirmação `whoami=node` pendente no build Docker local.
