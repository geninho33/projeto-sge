# SGE-047 - Arquivos Temporários

- Prioridade: P2
- Modulo: Parametrização
- Menu: Tabelas do Sistema > Arquivos Temporários
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HSelArquivosTemporarios.aspx
- WebPanel KB: `HSelArquivosTemporarios`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 3
- Dependencias WebPanel: 0
- Dependencias Transaction: 0
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 4
- Subs: 0
- grid.Load: 0
- Transaction.Call (suplemento XML): 0

## Arvore completa

```text
WebPanel:HSelArquivosTemporarios [raiz]
├── Procedure:PArquivosTemporarios [calls_procedure|index]
├── Procedure:PArquivosTemporarios [calls_procedure_inferred|xml]
├── Procedure:PAtualiza_AluCodFot [calls_procedure|index]
├── Procedure:PAtualiza_AluCodFot [calls_procedure_inferred|xml]
├── Procedure:PGravaNotaAlunoDescritivaDisc [calls_procedure|index]
└── Procedure:PGravaNotaAlunoDescritivaDisc [calls_procedure_inferred|xml]
```
