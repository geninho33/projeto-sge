# SGE-057 - Cor ou Raça da Lista de Espera

- Prioridade: P2
- Modulo: Lista Espera Infantil
- Menu: Tabelas do Sistema > Cor e Raça
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelCorRaca_LE.aspx
- WebPanel KB: `HSelCorRaca_LE`
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
- Events: 11
- Subs: 1
- grid.Load: 0
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelCorRaca_LE [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
└── Transaction:TCorRaca_LE [calls_transaction_inferred|xml]
```
