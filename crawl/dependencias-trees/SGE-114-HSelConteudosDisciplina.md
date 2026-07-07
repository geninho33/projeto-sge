# SGE-114 - Lista de Conteúdos/Disciplina

- Prioridade: P3
- Modulo: Parametrização
- Menu: Matrizes > Conteúdos/Disciplinas
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HSelConteudosDisciplina.aspx
- WebPanel KB: `HSelConteudosDisciplina`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 2
- Dependencias WebPanel: 2
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 14
- Subs: 1
- grid.Load: 0
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelConteudosDisciplina [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Transaction:TListaDisciplina [calls_transaction_inferred|xml]
├── WebPanel:HConteudosDisciplina [calls_webpanel_inferred|xml]
└── WebPanel:HGrupoTurmasConteudoDisciplina [calls_webpanel_inferred|xml]
    └── Procedure:PGrupoTurmasConteudo [calls_procedure|index]
```
