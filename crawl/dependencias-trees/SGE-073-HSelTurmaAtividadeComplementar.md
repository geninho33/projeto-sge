# SGE-073 - Atividades Complementares

- Prioridade: P2
- Modulo: Secretaria Educação
- Menu: Trabalhar com Turmas > Atividade Complementar
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelTurmaAtividadeComplementar.aspx
- WebPanel KB: `HSelTurmaAtividadeComplementar`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 6
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
WebPanel:HSelTurmaAtividadeComplementar [raiz]
├── Procedure:PBuscaProfessorRegente [calls_procedure|index]
├── Procedure:PBuscaProfessorRegente [calls_procedure_inferred|xml]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PContaAtestadoVaga [calls_procedure|index]
│   └── Procedure:PContaDiasNaoUteis [calls_procedure|index]
├── Procedure:PContaAtestadoVaga [calls_procedure_inferred|xml]
│   └── Procedure:PContaDiasNaoUteis [calls_procedure|index]
├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── Procedure:PDescricaoEtapaNova [calls_procedure_inferred|xml]
└── WebPanel:HSelAlunoAtividadeComplementar [calls_webpanel_inferred|xml]
    ├── Procedure:PCgcCpf [calls_procedure|index]
    └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
```
