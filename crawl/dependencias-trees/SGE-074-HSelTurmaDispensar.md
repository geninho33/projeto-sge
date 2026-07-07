# SGE-074 - Dispensar por Turma/Disciplina

- Prioridade: P2
- Modulo: Secretaria Educação
- Menu: Trabalhar com Turmas > Dispensar por Disciplina
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelTurmaDispensar.aspx
- WebPanel KB: `HSelTurmaDispensar`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 7
- Dependencias WebPanel: 1
- Dependencias Transaction: 0
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 9
- Subs: 2
- grid.Load: 1
- Transaction.Call (suplemento XML): 0

## Arvore completa

```text
WebPanel:HSelTurmaDispensar [raiz]
├── Procedure:PBuscaProfessorRegente [calls_procedure|index]
├── Procedure:PBuscaProfessorRegente [calls_procedure_inferred|xml]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PContaAtestadoVaga [calls_procedure|index]
│   └── Procedure:PContaDiasNaoUteis [calls_procedure|index]
├── Procedure:PContaAtestadoVaga [calls_procedure_inferred|xml]
│   └── Procedure:PContaDiasNaoUteis [calls_procedure|index]
├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── Procedure:PDescricaoEtapaNova [calls_procedure_inferred|xml]
└── WebPanel:HTurmaDispensarDisciplina [calls_webpanel_inferred|xml]
    ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
    └── Procedure:PDisDisc [calls_procedure|index]
        └── Procedure:PGravaAdmLog [calls_procedure|index]
```
