# Git Workflow — Migração SGE

## Branches por item de backlog

```
feature/frontend/SGE-{NNN}-{slug}   → sge-web, sge-bff
feature/backend/SGE-{NNN}-{slug}    → GeneXus KB (pasta genexus/)
```

## Exemplo

```
feature/frontend/SGE-004-unidade-escolar
feature/backend/SGE-004-unidade-escolar
```

## Fluxo de merge

1. **Backend sempre merge antes do frontend** (contrato API disponível)
2. Nome `SGE-{NNN}` **idêntico** em ambas as branches
3. PR referencia `MapeamentoMudanca` no PM
4. `release/SGE-sprint-{N}` para homologação ao fim da sprint
5. **Proibido** merge de frontend sem contrato em `docs/api-contracts/SGE-{NNN}.yaml`

## Definition of Done (híbrido)

Item `concluido` quando:

- `status_back = merged` + REST documentado
- `status_front = merged` + tela em homologação
- QA validou paridade com screenshot/URL legado
- Tech Lead aprovou contrato JSON de grid

## Trunk

- `main` — produção
- `develop` — integração contínua
- Tags: `SGE-{NNN}` ao concluir item
