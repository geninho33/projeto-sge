# SGE-033 - Países

- Prioridade: P2
- Modulo: Parametrização
- Menu: Tabelas do Sistema > Países
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HSelPais.aspx
- WebPanel KB: `HSelPais`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 1
- Dependencias WebPanel: 0
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 11
- Subs: 1
- grid.Load: 0
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelPais [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
└── Transaction:TPais_w [calls_transaction_inferred|xml]
```
