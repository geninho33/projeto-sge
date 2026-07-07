# SGE-004 - Unidades Escolares

- Prioridade: P1
- Modulo: Secretaria Educação
- Menu: Cadastros > Unidade Escolar
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hselunidadeescolar_8105.aspx
- WebPanel KB: `HSelUnidadeEscolar_8105`
- Tier conversao: **XL**
- Estimativa API: 19-30 dias
- Estimativa Frontend: 20-35 dias
- Risco: alto

## Metricas tecnicas

- Dependencias Procedure: 15
- Dependencias WebPanel: 6
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 20
- Subs: 1
- grid.Load: 0
- Transaction.Call (suplemento XML): 3

## Arvore completa

```text
WebPanel:HSelUnidadeEscolar_8105 [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Transaction:TUnidadeEscolar_w [calls_transaction_inferred|xml]
├── WebPanel:HConsultaCadastroUE [calls_webpanel_inferred|xml]
├── WebPanel:HConsultaCursoUE [calls_webpanel_inferred|xml]
├── WebPanel:HSelRegistroPresenca [calls_webpanel_inferred|xml]
├── WebPanel:HSelUEDespesas [calls_webpanel_inferred|xml]
├── WebPanel:HSelUEProUca [calls_webpanel_inferred|xml]
└── WebPanel:HSelUeMatrizInicializar [calls_webpanel_inferred|xml]
    ├── Procedure:PAddEnt [calls_procedure|index]
    ├── Procedure:PArruma_MatrizUeEtapa [calls_procedure|index]
    ├── Procedure:PAtCargaHoraria [calls_procedure|index]
    │   └── Procedure:PCalFrequenciaAvaCon [calls_procedure|index]
    ├── Procedure:PAtualizaMatrizUE [calls_procedure|index]
    ├── Procedure:PGrDisciplinasTurma [calls_procedure|index]
    │   └── Procedure:PExDisciplinaTurma [calls_procedure|index]
    │       └── Procedure:PGrCargaHorariaAluno [calls_procedure|index]
    ├── Procedure:PInToMatriz [calls_procedure|index]
    ├── Procedure:PMatrizUeEtapa [calls_procedure|index]
    ├── Procedure:PMatrizUeEtapaDisciplina [calls_procedure|index]
    └── Procedure:PReplicarTurmasAnoSeguinte [calls_procedure|index]
        ├── Procedure:PAddDisciplinas [calls_procedure|index]
        └── Procedure:PConsultaDatasCalendarioUE [calls_procedure|index]
```
