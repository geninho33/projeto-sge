# SGE-037 - Tipos de Calendário

- Prioridade: P2
- Modulo: Calendário Escolar
- Menu: Trabalhar com Calendário Escolar > Tipos de Calendário
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelCalendarioTipo.aspx
- WebPanel KB: `HSelCalendarioTipo`
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
- Events: 5
- Subs: 0
- grid.Load: 0
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelCalendarioTipo [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PCopiaCalendarioUEDias [calls_procedure|index]
├── Procedure:PCopiaCalendarioUEDias [calls_procedure_inferred|xml]
└── Transaction:TCalendarioTipo [calls_transaction_inferred|xml]
```
