# SGE-095 - Quadro de Vagas

- Prioridade: P2
- Modulo: Lista Espera Infantil
- Menu: Tabelas do Sistema > Vagas Creches
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelQuadroVagasCreche.aspx
- WebPanel KB: `HSelQuadroVagasCreche`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 4
- Dependencias WebPanel: 2
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 13
- Subs: 1
- grid.Load: 0
- Transaction.Call (suplemento XML): 2

## Arvore completa

```text
WebPanel:HSelQuadroVagasCreche [raiz]
├── Procedure:PConsultaMostra [calls_procedure_udp_inferred|xml]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Transaction:TQuadroVagasCreche [calls_transaction_inferred|xml]
├── WebPanel:HQuadroVagasCreche [calls_webpanel_inferred|xml]
│   └── Procedure:PIncluiQuadroVagasCreche [calls_procedure|index]
│       └── Procedure:PGravaAdmLog [calls_procedure|index]
└── WebPanel:HQuadroVagasCrecheGrid7493 [calls_webpanel_inferred|xml]
    └── Procedure:PIncluiQuadroVagasCreche [calls_procedure|index]
        └── Procedure:PGravaAdmLog [calls_procedure|index]
```
