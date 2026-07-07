# SGE-061 - Solicitar Transferência dentro da Rede

- Prioridade: P2
- Modulo: Secretaria Educação
- Menu: Trabalhar com Estudantes > Transferência On-Line > Solicitar Transferência - Destino
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelAlunoTransfOnLine.aspx
- WebPanel KB: `HSelAlunoTransfOnLine`
- Tier conversao: **L**
- Estimativa API: 11-18 dias
- Estimativa Frontend: 12-20 dias
- Risco: medio

## Metricas tecnicas

- Dependencias Procedure: 22
- Dependencias WebPanel: 2
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 14
- Subs: 2
- grid.Load: 1
- Transaction.Call (suplemento XML): 2

## Arvore completa

```text
WebPanel:HSelAlunoTransfOnLine [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── Procedure:PDescricaoEtapaNova [calls_procedure_inferred|xml]
├── Procedure:PIdadeGrupoLE [calls_procedure_inferred|xml]
├── Transaction:TAluno_w [calls_transaction_inferred|xml]
├── WebPanel:HConsultaEnturmacaoAluno [calls_webpanel_inferred|xml]
└── WebPanel:HSelAlunoAvaliacaoDisciplina [calls_webpanel_inferred|xml]
    ├── Procedure:PAddEnturmacao [calls_procedure|index]
    ├── Procedure:PAplicaFormula [calls_procedure|index]
    │   ├── Procedure:PCalExp [calls_procedure|index]
    │   └── Procedure:PCalculaExameFinalProficiencia [calls_procedure|index]
    ├── Procedure:PAplicaFormulacRecDiarioElet [calls_procedure|index]
    │   ├── Procedure:PAplicaFormula [calls_procedure|index]
    │   │   ├── Procedure:PCalExp [calls_procedure|index]
    │   │   └── Procedure:PCalculaExameFinalProficiencia [calls_procedure|index]
    │   └── Procedure:PCalExp [calls_procedure|index]
    ├── Procedure:PAtCargaHoraria [calls_procedure|index]
    │   └── Procedure:PCalFrequenciaAvaCon [calls_procedure|index]
    ├── Procedure:PCalFrequenciaAvaDes [calls_procedure|index]
    ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
    ├── Procedure:PExcluiMediasFinais [calls_procedure|index]
    ├── Procedure:PGrHistoricoAluno2 [calls_procedure|index]
    │   ├── Procedure:PGrCursoFormHisto [calls_procedure|index]
    │   ├── Procedure:PPeAvaliacaoCompDescHistorico [calls_procedure|index]
    │   ├── Procedure:PPeAvaliacaoDescHistorico [calls_procedure|index]
    │   ├── Procedure:PPeNotaHistorico [calls_procedure|index]
    │   └── Procedure:PRetornaCargaHoraria [calls_procedure|index]
    ├── Procedure:PGrSituacaoCursoAluno [calls_procedure|index]
    ├── Procedure:PGravaAdmLog [calls_procedure|index]
    ├── Procedure:PObterURL [calls_procedure|index]
    └── Procedure:PVerAvaliacaoNE [calls_procedure|index]
```
