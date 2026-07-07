# SGE-059 - Tabela de Descritores/Habilidades

- Prioridade: P2
- Modulo: Secretaria Educação
- Menu: Trabalhar com Turmas > Atualizar Habilidades
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelCompetencias.aspx
- WebPanel KB: `HSelCompetencias`
- Tier conversao: **M**
- Estimativa API: 6-10 dias
- Estimativa Frontend: 8-12 dias
- Risco: medio

## Metricas tecnicas

- Dependencias Procedure: 4
- Dependencias WebPanel: 1
- Dependencias Transaction: 3
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 19
- Subs: 2
- grid.Load: 0
- Transaction.Call (suplemento XML): 5

## Arvore completa

```text
WebPanel:HSelCompetencias [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PCriarRespostasHabilidades [calls_procedure|index]
├── Procedure:PCriarRespostasHabilidades [calls_procedure_inferred|xml]
├── Procedure:PIncluiCompetenciaDisciplina [calls_procedure|index]
├── Procedure:PIncluiCompetenciaDisciplina [calls_procedure_inferred|xml]
├── Transaction:TCompetencias [calls_transaction_inferred|xml]
├── Transaction:TCompetenciasExclusao [calls_transaction_inferred|xml]
├── Transaction:TCompetenciasRespostas [calls_transaction_inferred|xml]
└── WebPanel:HAtualizaCompetencia [calls_webpanel_inferred|xml]
    └── Procedure:PAtualizaCompetencia [calls_procedure|index]
```
