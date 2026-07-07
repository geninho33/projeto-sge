# SGE-106 - IntelliBR Gestão Educacional

- Prioridade: P3
- Modulo: Home
- Menu: Tela inicial
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hprincipal.aspx
- WebPanel KB: `HPrincipal`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 4
- Dependencias WebPanel: 2
- Dependencias Transaction: 0
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 9
- Subs: 5
- grid.Load: 0
- Transaction.Call (suplemento XML): 0

## Arvore completa

```text
WebPanel:HPrincipal [raiz]
├── Procedure:PExcluirArquivosTemporarios [calls_procedure_inferred|xml]
├── Procedure:PGeraLog [calls_procedure_inferred|xml]
├── WebPanel:HSistemaOffLine [calls_webpanel_inferred|xml]
│   └── Procedure:PGravaAdmLog [calls_procedure|index]
└── WebPanel:HTelaPerdeuSessao [calls_webpanel_inferred|xml]
    └── Procedure:PObterURL [calls_procedure|index]
```
