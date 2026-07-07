# SGE-012 - Cursos

- Prioridade: P1
- Modulo: Parametrização
- Menu: Tabelas do Sistema > Cursos
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HSelCurso.aspx
- WebPanel KB: `HSelCurso`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 1
- Dependencias WebPanel: 0
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 10
- Subs: 1
- grid.Load: 0
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelCurso [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
└── Transaction:TCurso_w [calls_transaction_inferred|xml]
```
