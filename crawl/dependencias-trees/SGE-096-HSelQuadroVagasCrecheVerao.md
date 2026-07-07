# SGE-096 - Quadro de Vagas Educar no Verão

- Prioridade: P2
- Modulo: Lista Espera Infantil
- Menu: Tabelas do Sistema > Vagas Creches Verão
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelQuadroVagasCrecheVerao.aspx
- WebPanel KB: `HSelQuadroVagasCrecheVerao`
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
- Events: 13
- Subs: 1
- grid.Load: 1
- Transaction.Call (suplemento XML): 2

## Arvore completa

```text
WebPanel:HSelQuadroVagasCrecheVerao [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Transaction:TQuadroVagasCreche [calls_transaction_inferred|xml]
└── WebPanel:HQuadroVagasCrecheVerao [calls_webpanel_inferred|xml]
    └── Procedure:PIncluiQuadroVagasCrecheVerao [calls_procedure|index]
        └── Procedure:PGravaAdmLog [calls_procedure|index]
```
