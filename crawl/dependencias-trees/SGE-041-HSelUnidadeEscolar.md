# SGE-041 - Unidades Escolares

- Prioridade: P2
- Modulo: Lista Espera Infantil
- Menu: Tabelas do Sistema > Unidade Escolar
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelUnidadeEscolar.aspx
- WebPanel KB: `HSelUnidadeEscolar`
- Tier conversao: **L**
- Estimativa API: 11-18 dias
- Estimativa Frontend: 12-20 dias
- Risco: alto

## Metricas tecnicas

- Dependencias Procedure: 15
- Dependencias WebPanel: 5
- Dependencias Transaction: 12
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 28
- Subs: 1
- grid.Load: 0
- Transaction.Call (suplemento XML): 14

## Arvore completa

```text
WebPanel:HSelUnidadeEscolar [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Transaction:TUEAtividadesProjetos [calls_transaction_inferred|xml]
├── Transaction:TUECaracteristicas [calls_transaction_inferred|xml]
├── Transaction:TUEImobiliario [calls_transaction_inferred|xml]
├── Transaction:TUEInstrumentosMateriais [calls_transaction_inferred|xml]
├── Transaction:TUEMobiliario [calls_transaction_inferred|xml]
├── Transaction:TUERecursosHumanos [calls_transaction_inferred|xml]
├── Transaction:TUnidadeEscolar01 [calls_transaction_inferred|xml]
├── Transaction:TUnidadeEscolar02 [calls_transaction_inferred|xml]
├── Transaction:TUnidadeEscolar03 [calls_transaction_inferred|xml]
├── Transaction:TUnidadeEscolar04 [calls_transaction_inferred|xml]
├── Transaction:TUnidadeEscolar05 [calls_transaction_inferred|xml]
├── Transaction:TUnidadeEscolar_w [calls_transaction_inferred|xml]
├── WebPanel:HConsultaCadastroUE [calls_webpanel_inferred|xml]
├── WebPanel:HConsultaCursoUE [calls_webpanel_inferred|xml]
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
