# SGE-079 - Acessos ao Sistema

- Prioridade: P2
- Modulo: Lista Espera Infantil
- Menu: Tabelas do Sistema > Acessos ao Sistema
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelAcesso.aspx
- WebPanel KB: `HSelAcesso`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 0
- Dependencias WebPanel: 1
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 10
- Subs: 1
- grid.Load: 1
- Transaction.Call (suplemento XML): 1

## Arvore completa

```text
WebPanel:HSelAcesso [raiz]
├── Transaction:TAcesso_w [calls_transaction_inferred|xml]
└── WebPanel:HAcesso [calls_webpanel_inferred|xml]
```
