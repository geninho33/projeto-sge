# SGE-010 - Tabela de Disciplinas

- Prioridade: P1
- Modulo: Parametrização
- Menu: Tabelas do Sistema > Disciplinas
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HSelDisciplina.aspx
- WebPanel KB: `HSelDisciplina`
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
WebPanel:HSelDisciplina [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
└── Transaction:TDisciplina_w [calls_transaction_inferred|xml]
```
