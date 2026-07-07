# SGE-104 - Tabela Caracterização Núcleo Comum

- Prioridade: P3
- Modulo: Parametrização
- Menu: Parâmetros do Diário Eletrônico > Caracterização Núcleo Comum
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HSelTabCaracteristicaNC.aspx
- WebPanel KB: `HSelTabCaracteristicaNC`
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
- Events: 9
- Subs: 1
- grid.Load: 0
- Transaction.Call (suplemento XML): 3

## Arvore completa

```text
WebPanel:HSelTabCaracteristicaNC [raiz]
└── Transaction:TTabCaracteristicaNC [calls_transaction_inferred|xml]
```
