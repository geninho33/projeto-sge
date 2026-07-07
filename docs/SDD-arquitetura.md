# SDD — Arquitetura da Solução (Migração SGE)

## Visão geral

Arquitetura **híbrida**: Frontend React consumindo APIs REST expostas pelo GeneXus 18, com BFF Node.js para auth, normalização de payloads e estratégia de transição.

```
Browser → sge-web (React) → sge-bff (Node/Express) → GeneXus REST + GAM OAuth2
                         ↘ sge-pm-web → sge-pm-api → MySQL (sge_pm_*)
```

## Camadas

| Camada | Tecnologia | Responsabilidade |
|--------|------------|------------------|
| sge-pm-web / sge-pm-api | React + Express | Gestão do projeto de migração |
| sge-web | React 19 + Vite | Telas migradas do SGE |
| sge-bff | Node 20 + Express | Auth bridge GAM→JWT, paginação padronizada |
| GeneXus REST | GX18 REST Services | Regras de negócio puras |
| GAM | GeneXus GAM | OAuth2/JWT, perfis |

## Autenticação

1. `sge-web` obtém token via GAM (`POST /oauth/access_token`)
2. Token enviado ao BFF em `Authorization: Bearer`
3. BFF valida e repassa ao GeneXus REST

### Headers de contexto SGE

```
Authorization: Bearer <jwt>
X-SGE-Ano: 2026
X-SGE-UE: 8105
X-SGE-Prefeitura: <codigo>
X-Request-Id: <uuid>
```

## Contrato JSON — Grids paginadas

### Request (GET)

```
?page=1&limit=20&orderBy=campo&orderDir=asc&q=texto&status=A
```

### Response

```json
{
  "data": [{ "id": 1, "nome": "..." }],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "sort": { "orderBy": "nome", "orderDir": "asc" }
  }
}
```

### Erro

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "...",
    "details": [{ "field": "x", "rule": "required" }],
    "traceId": "uuid"
  }
}
```

## Repositório

Ver estrutura em [README.md](../README.md).

## Referência

Padrão validado no projeto `sga` (Alimentação Escolar): Express + React + MySQL GeneXus.
