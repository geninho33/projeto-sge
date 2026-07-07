# SGE-016 - Tabela Exclusão Escolar

- Prioridade: P1
- Modulo: Parametrização
- Menu: Parâmetros do Diário Eletrônico > Causas de Exclusão Escolar
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HSelTabExclusaoEscolar.aspx
- WebPanel KB: `HSelTabExclusaoEscolar`
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
- Events: 10
- Subs: 0
- grid.Load: 0
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelTabExclusaoEscolar [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PVerificaUsoTabExclusaoEscolar [calls_procedure|index]
├── Procedure:PVerificaUsoTabExclusaoEscolar [calls_procedure_inferred|xml]
└── Transaction:TTabExclusaoEscolar [calls_transaction_inferred|xml]
```
