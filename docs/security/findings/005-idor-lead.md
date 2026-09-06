# Finding 005

## Área
Autorização — IDOR de Lead cross-tenant / cross-vendedor

## Código/Fluxo analisado
CRUD `/leads` (dados comerciais por `empresaId`). Lead **não** tem senha/JWT.

## Problema identificado
Sem filtro de tenant (e sem regra de responsável), um ator autenticado poderia ler/alterar leads de outra empresa ou de outro vendedor.

## Como o problema poderia acontecer
1. Token da Empresa A (ou USER sem ser responsável).
2. UUID de lead da Empresa B (ou lead de outro USER).
3. `GET/PATCH/DELETE /leads/<uuid>` sem escopo → vazamento ou alteração indevida.

## Risco
Vazamento de pipeline comercial (telefone, interesse, status) entre tenants ou entre vendedores.

## Por que isso é um risco?
Lead é o ativo do funil. Isolamento de tenant + escopo de responsável é autorização, não “filtro de UI”.

## Mitigação estudada
- Toda query com `empresaId` do token; fora do tenant → 404.
- Staff vê/cria/edita/deleta todos do tenant.
- USER só lê/edita se `responsavelUsuarioId === sub`; DELETE só staff.
- `telefone` único por `(empresaId, telefone)`.

Review atacaria: token A + lead B → 404; USER em lead de outro → 403; USER DELETE → 403; telefone duplicado no tenant → 409.

## Correção implementada
- Model `Lead` + rotas `/leads`.
- `leadService` aplica escopo tenant + regra B de responsável.
- Finding documentado neste arquivo.

## Como validei
Bateria HTTP local do ciclo 5.

## Status
Corrigido e confirmado em runtime (ciclo 5: IDOR cross-tenant 404; USER só no próprio lead; DELETE só staff; telefone único 409).
