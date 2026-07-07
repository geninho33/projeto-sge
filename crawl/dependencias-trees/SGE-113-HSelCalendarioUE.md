# SGE-113 - Calendário da Unidade Escolar

- Prioridade: P3
- Modulo: Calendário Escolar
- Menu: Trabalhar com Calendário Escolar > Calendário das UEs
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelCalendarioUE.aspx
- WebPanel KB: `HSelCalendarioUE`
- Tier conversao: **L**
- Estimativa API: 11-18 dias
- Estimativa Frontend: 12-20 dias
- Risco: medio

## Metricas tecnicas

- Dependencias Procedure: 9
- Dependencias WebPanel: 8
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 17
- Subs: 0
- grid.Load: 0
- Transaction.Call (suplemento XML): 2

## Arvore completa

```text
WebPanel:HSelCalendarioUE [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PSituacaoCalendarioUeDias [calls_procedure|index]
├── Procedure:PSituacaoCalendarioUeDias [calls_procedure_inferred|xml]
├── Transaction:TCalendarioUE [calls_transaction_inferred|xml]
├── WebPanel:HCalUE004 [calls_webpanel|index]
├── WebPanel:HCalendarioCopiar [calls_webpanel_inferred|xml]
│   └── Procedure:PCopiaCalendarioUE [calls_procedure|index]
├── WebPanel:HCalendarioUE [calls_webpanel_inferred|xml]
│   ├── Procedure:PAlteraCalendarioUEDias [calls_procedure|index]
│   ├── Procedure:PIncluiCalendarioUEDias [calls_procedure|index]
│   └── Procedure:PSituacaoCalendarioUeDias [calls_procedure|index]
├── WebPanel:HCalendarioUE2 [calls_webpanel_inferred|xml]
│   └── Procedure:PIncluiCalendarioUEDias [calls_procedure|index]
├── WebPanel:HCalendarioUEDetalhes [calls_webpanel_inferred|xml]
├── WebPanel:HExcluiCalendarioUE [calls_webpanel_inferred|xml]
│   └── Procedure:PExcluiCalendarioUE [calls_procedure|index]
├── WebPanel:HIncluiCalendarioUE [calls_webpanel_inferred|xml]
│   └── Procedure:PIncluiCalendarioUE [calls_procedure|index]
│       └── Procedure:PGravaAdmLog [calls_procedure|index]
└── WebPanel:HInicioFimPeriodosUE [calls_webpanel_inferred|xml]
    ├── Procedure:PGravaAdmLog [calls_procedure|index]
    └── Procedure:PInicioFimPeriodosCalendarioUE [calls_procedure|index]
```
