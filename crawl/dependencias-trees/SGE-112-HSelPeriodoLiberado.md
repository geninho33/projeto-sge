# SGE-112 - Períodos Liberados do Diário Eletrônico

- Prioridade: P3
- Modulo: Parametrização
- Menu: Parâmetros do Diário Eletrônico > Períodos Liberados
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HSelPeriodoLiberado.aspx
- WebPanel KB: `HSelPeriodoLiberado`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 2
- Dependencias WebPanel: 0
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 8
- Subs: 0
- grid.Load: 0
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelPeriodoLiberado [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PIncluiParametroSGE [calls_procedure|index]
├── Procedure:PIncluiParametroSGE [calls_procedure_inferred|xml]
└── Transaction:TPeriodoLiberado [calls_transaction_inferred|xml]
```
