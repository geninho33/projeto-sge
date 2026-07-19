# Projeto SGE — Migração Híbrida

Monorepo para migração do Sistema de Gestão Escolar (GeneXus Web Forms → React + GeneXus REST).

## Estrutura

| Pacote | Porta | Descrição |
|--------|-------|-----------|
| `sge-pm-api` | 3010 | API do sistema de gestão do projeto (backlog, sprints, skills) |
| `sge-pm-web` | 5174 | UI do PM (Kanban, sprint board, mapeamento) |
| `sge-bff` | 3020 | BFF de negócio (auth GAM, grids paginadas) |
| `sge-web` | 5175 | Telas migradas do SGE |
| `packages/sge-ui` | — | Componentes compartilhados (grid, shell) |

## Setup rápido

```bash
# Banco PM (opcional — docker)
docker compose up -d

cd sge-pm-api && cp .env.example .env && npm install
cd ../sge-pm-web && npm install
cd .. && npm run migrate:pm
npm run import:backlog

# PM
npm run pm:api    # terminal 1
npm run pm:web    # terminal 2

# SGE (telas migradas)
cd sge-bff && cp .env.example .env && npm install
cd ../sge-web && npm install
npm run dev -w sge-bff
npm run dev -w sge-web
```

## Documentação

- [SDD — Arquitetura](docs/SDD-arquitetura.md)
- [Skill Matrix](docs/skill-matrix.md)
- [Git Workflow](docs/git-workflow.md)
- [ADR-001 — Camada API](docs/adr-001-api-layer.md)

## Backlog

115 telas em `crawl/crawl-report.json`, importadas via `npm run import:backlog` (API autenticada; padrão `gestor@sge.local` / `Sge@2026`). Em Docker: `./deploy.sh import-backlog`.
