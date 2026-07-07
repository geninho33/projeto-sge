# SGE-008 - Municípios

- Prioridade: P1
- Modulo: Lista Espera Infantil
- Menu: Tabelas do Sistema > Municípios
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelMunicipio.aspx
- WebPanel KB: `HSelMunicipio`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 3
- Dependencias WebPanel: 1
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 14
- Subs: 1
- grid.Load: 0
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelMunicipio [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PContaProfsDisciplina [calls_procedure|index]
│   └── SDT:sdt_ConsultaDocente [uses_resolved_custom_type|index]
├── Procedure:PContaProfsDisciplina [calls_procedure_inferred|xml]
│   └── SDT:sdt_ConsultaDocente [uses_resolved_custom_type|index]
├── Procedure:PGeraExcelWeb [calls_procedure|index]
├── Procedure:PGeraExcelWeb [calls_procedure_inferred|xml]
├── Transaction:TMunicipio_w [calls_transaction_inferred|xml]
└── WebPanel:HRelMunicipio [calls_webpanel_inferred|xml]
```
