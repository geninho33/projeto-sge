# ADR-001 — Camada de API (BFF + GeneXus REST)

**Status:** Aceito  
**Data:** 2026-07-02  
**Contexto:** Decisão "Outro" na escolha de arquitetura API.

## Decisão

Adotar **duas camadas de API**:

1. **GeneXus REST** — dono das regras de negócio (CRUD, validações, transações)
2. **sge-bff (Node/Express)** — auth bridge GAM→JWT, normalização de paginação/filtros, cache de lookups, modo mock durante transição

## Alternativas consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| React → GeneXus REST direto | Menos componentes | Payloads heterogêneos, auth complexa no browser |
| React → Node BFF → MySQL direto (SGA) | Rápido para CRUD | Duplica regra de negócio GeneXus |
| **BFF + GeneXus REST (escolhida)** | Separação clara, transição gradual | Mais um hop de rede |

## Consequências

- BFF **não duplica** regra de negócio — delega ao REST GeneXus quando disponível
- Durante migração, BFF usa `mockStore` para telas sem REST ainda publicado
- Contratos OpenAPI em `docs/api-contracts/` são a fonte de verdade entre front e back
- Headers `X-SGE-Ano`, `X-SGE-UE` propagados em todas as chamadas

## Implementação

- `sge-bff/src/middleware/auth.js` — validação JWT/GAM
- `sge-bff/src/middleware/context.js` — Ano/UE/Prefeitura
- `sge-bff/src/lib/pagination.js` — contrato unificado de grid
- `sge-bff/src/services/genexusProxy.js` — proxy para REST GeneXus (quando configurado)
