# SGE-103 - Calendário do Município

- Prioridade: P3
- Modulo: Calendário Escolar
- Menu: Trabalhar com Calendário Escolar > Calendário do Município
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelCalendarioMun.aspx
- WebPanel KB: `HSelCalendarioMun`
- Tier conversao: **M**
- Estimativa API: 6-10 dias
- Estimativa Frontend: 8-12 dias
- Risco: medio

## Metricas tecnicas

- Dependencias Procedure: 8
- Dependencias WebPanel: 3
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 11
- Subs: 0
- grid.Load: 0
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelCalendarioMun [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PCopiaCalendarioUEDias [calls_procedure|index]
├── Procedure:PCopiaCalendarioUEDias [calls_procedure_inferred|xml]
├── Transaction:TCalendarioMun [calls_transaction_inferred|xml]
├── WebPanel:HCal004 [calls_webpanel|index]
├── WebPanel:HCalendarioMun [calls_webpanel_inferred|xml]
│   ├── Procedure:PAlteraCalendarioMunDias [calls_procedure|index]
│   └── Procedure:PIncluiCalendarioMunDias [calls_procedure|index]
└── WebPanel:HInicioFimPeriodosMun [calls_webpanel_inferred|xml]
    ├── Procedure:PAtualizarCalendarioUEs [calls_procedure|index]
    ├── Procedure:PGravaAdmLog [calls_procedure|index]
    ├── Procedure:PInicioFimPeriodosCalendarioMun [calls_procedure|index]
    └── Procedure:PInicioFimPeriodosCalendarioUE [calls_procedure|index]
```
