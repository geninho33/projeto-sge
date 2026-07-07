# SGE-066 - Turmas para Movimentação de Estudante(s)

- Prioridade: P2
- Modulo: Secretaria Educação
- Menu: Trabalhar com Estudantes > Movimentação
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelTurmaMoviment.aspx
- WebPanel KB: `HSelTurmaMoviment`
- Tier conversao: **M**
- Estimativa API: 6-10 dias
- Estimativa Frontend: 8-12 dias
- Risco: medio

## Metricas tecnicas

- Dependencias Procedure: 12
- Dependencias WebPanel: 2
- Dependencias Transaction: 0
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 10
- Subs: 2
- grid.Load: 1
- Transaction.Call (suplemento XML): 0

## Arvore completa

```text
WebPanel:HSelTurmaMoviment [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── Procedure:PDescricaoEtapaNova [calls_procedure_inferred|xml]
├── WebPanel:HSelTurmaMovAluNova [calls_webpanel_inferred|xml]
│   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   └── Procedure:PDescricaoTurma [calls_procedure|index]
│       └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
└── WebPanel:HSelTurmaMovTurNova [calls_webpanel_inferred|xml]
    ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
    └── Procedure:PMovTurmaMatrizTurno [calls_procedure|index]
        ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
        ├── Procedure:PGrCargaHorariaAluno [calls_procedure|index]
        ├── Procedure:PGrSituacaoCursoAluno [calls_procedure|index]
        ├── Procedure:PGravaAdmLog [calls_procedure|index]
        └── Procedure:PMoveAluno [calls_procedure|index]
            ├── Procedure:PBaixaListaFund_por_Mov [calls_procedure|index]
            ├── Procedure:PConsultaEstudanteNovo [calls_procedure|index]
            ├── Procedure:PGrCargaHorariaAluno [calls_procedure|index]
            ├── Procedure:PGrSituacaoCursoAluno [calls_procedure|index]
            ├── Procedure:PHistoricoMovimentacao [calls_procedure|index]
            └── Procedure:PMoveDiarioEletronico [calls_procedure|index]
```
