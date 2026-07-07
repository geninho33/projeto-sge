# SGE-020 - Tabela de Itens de Planejamento de Aula

- Prioridade: P1
- Modulo: Parametrização
- Menu: Parâmetros do Diário Eletrônico > Itens para Planejamento Aula
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HSelTabPlanejamentoAula.aspx
- WebPanel KB: `HSelTabPlanejamentoAula`
- Tier conversao: **XS**
- Estimativa API: 1-2 dias
- Estimativa Frontend: 2-3 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 1
- Dependencias WebPanel: 0
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 9
- Subs: 1
- grid.Load: 0
- Transaction.Call (suplemento XML): 3

## Arvore completa

```text
WebPanel:HSelTabPlanejamentoAula [raiz]
├── Procedure:PVerificaUsoTabPlanejamentoAula [calls_procedure|index]
├── Procedure:PVerificaUsoTabPlanejamentoAula [calls_procedure_inferred|xml]
└── Transaction:TTabPlanejamentoAula [calls_transaction_inferred|xml]
```
