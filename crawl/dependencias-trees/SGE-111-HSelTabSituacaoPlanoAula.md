# SGE-111 - Tabela de Situação de Planejamentos de Aula

- Prioridade: P3
- Modulo: Parametrização
- Menu: Parâmetros do Diário Eletrônico > Situações de Planejamento Aula
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HSelTabSituacaoPlanoAula.aspx
- WebPanel KB: `HSelTabSituacaoPlanoAula`
- Tier conversao: **XS**
- Estimativa API: 1-2 dias
- Estimativa Frontend: 2-3 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 0
- Dependencias WebPanel: 0
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 10
- Subs: 1
- grid.Load: 0
- Transaction.Call (suplemento XML): 3

## Arvore completa

```text
WebPanel:HSelTabSituacaoPlanoAula [raiz]
└── Transaction:TTabPlanoAula [calls_transaction_inferred|xml]
```
