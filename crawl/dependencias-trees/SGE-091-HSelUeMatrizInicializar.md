# SGE-091 - Trabalhar com Matrizes da Unidade Escolar

- Prioridade: P2
- Modulo: Secretaria Educação
- Menu: Trabalhar com Turmas > Matrizes
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelUeMatrizinicializar.aspx
- WebPanel KB: `HSelUeMatrizInicializar`
- Tier conversao: **M**
- Estimativa API: 6-10 dias
- Estimativa Frontend: 8-12 dias
- Risco: medio

## Metricas tecnicas

- Dependencias Procedure: 17
- Dependencias WebPanel: 0
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 19
- Subs: 6
- grid.Load: 1
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelUeMatrizInicializar [raiz]
├── Procedure:PAddEnt [calls_procedure|index]
├── Procedure:PAddEnt [calls_procedure_inferred|xml]
├── Procedure:PAddEnturmacao [calls_procedure_inferred|xml]
├── Procedure:PAdicionaDisciplinaAlunos [calls_procedure_inferred|xml]
│   └── Procedure:PAddEnturmacao [calls_procedure|index]
├── Procedure:PArruma_MatrizUeEtapa [calls_procedure|index]
├── Procedure:PArruma_MatrizUeEtapa [calls_procedure_inferred|xml]
├── Procedure:PAtCargaHoraria [calls_procedure|index]
│   └── Procedure:PCalFrequenciaAvaCon [calls_procedure|index]
├── Procedure:PAtCargaHoraria [calls_procedure_inferred|xml]
│   └── Procedure:PCalFrequenciaAvaCon [calls_procedure|index]
├── Procedure:PAtualizaMatrizUE [calls_procedure|index]
├── Procedure:PAtualizaMatrizUE [calls_procedure_inferred|xml]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PGrDisciplinasTurma [calls_procedure|index]
│   └── Procedure:PExDisciplinaTurma [calls_procedure|index]
│       └── Procedure:PGrCargaHorariaAluno [calls_procedure|index]
├── Procedure:PInToMatriz [calls_procedure|index]
├── Procedure:PInToMatriz [calls_procedure_inferred|xml]
├── Procedure:PMatrizUeEtapa [calls_procedure|index]
├── Procedure:PMatrizUeEtapa [calls_procedure_inferred|xml]
├── Procedure:PMatrizUeEtapaDisciplina [calls_procedure|index]
├── Procedure:PMatrizUeEtapaDisciplina [calls_procedure_inferred|xml]
├── Procedure:PReplicarTurmasAnoSeguinte [calls_procedure|index]
│   ├── Procedure:PAddDisciplinas [calls_procedure|index]
│   └── Procedure:PConsultaDatasCalendarioUE [calls_procedure|index]
├── Procedure:PReplicarTurmasAnoSeguinte [calls_procedure_inferred|xml]
│   ├── Procedure:PAddDisciplinas [calls_procedure|index]
│   └── Procedure:PConsultaDatasCalendarioUE [calls_procedure|index]
└── Transaction:TCurUE_w [calls_transaction_inferred|xml]
```
