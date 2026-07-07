# Skill Matrix — Migração SGE

## Catálogo de skills

| ID | Skill | Lado | Nível mínimo |
|----|-------|------|--------------|
| SK-GX-01 | GeneXus 18 — Transactions/BC | Backend | Pleno |
| SK-GX-02 | REST Services / OData | Backend | Pleno |
| SK-GX-03 | Refatoração WebPanel → API | Backend | Sênior |
| SK-GX-04 | Otimização SQL / Data Providers | Backend | Sênior |
| SK-GX-05 | Segurança API (GAM OAuth2/JWT) | Backend | Sênior |
| SK-FE-01 | React + componentização | Frontend | Pleno |
| SK-FE-02 | Grids complexas (virtualização) | Frontend | Sênior |
| SK-FE-03 | State Management | Frontend | Pleno |
| SK-FE-04 | Axios + interceptors auth | Frontend | Pleno |
| SK-FE-05 | Formulários dinâmicos (schema-driven) | Frontend | Sênior |
| SK-PM-01 | Gestão ágil / backlog | PM | Pleno |
| SK-QA-01 | Testes E2E fluxos críticos | QA | Pleno |

## Matriz Score → Perfil

| Score | Backend | Frontend | QA |
|-------|---------|----------|-----|
| ≥ 350 | Sênior (GX-03,04,05) | Sênior (FE-02,05) | Sênior |
| 250–349 | Sênior ou Pleno+review | Sênior ou Pleno+review | Pleno |
| 180–249 | Pleno | Pleno | Pleno |
| 150–179 | Pleno | Pleno | Júnior+ |
| < 150 | Júnior/Pleno | Júnior/Pleno | Júnior |

## Atribuição automática

O `sge-pm-api` calcula `sge_pm_backlog_item_skill` via `skillResolver.js` a partir do score de cada item.

## Perfis PM

| Perfil | Permissões |
|--------|------------|
| gestor | Projeto, priorização, alocação |
| tech_lead | Aprova contratos API, merge cross-stack |
| dev_front | status_front, branches frontend |
| dev_back | status_back, branches GeneXus |
| qa | Critérios de aceite, homologação |
