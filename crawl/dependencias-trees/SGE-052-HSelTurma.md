# SGE-052 - Matrizes/Cursos para Inclusão de Turma

- Prioridade: P2
- Modulo: Secretaria Educação
- Menu: Trabalhar com Turmas > Cadastro
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelTurma.aspx
- WebPanel KB: `HSelTurma`
- Tier conversao: **XL**
- Estimativa API: 19-30 dias
- Estimativa Frontend: 20-35 dias
- Risco: alto

## Metricas tecnicas

- Dependencias Procedure: 30
- Dependencias WebPanel: 10
- Dependencias Transaction: 3
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 31
- Subs: 7
- grid.Load: 1
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelTurma [raiz]
├── Procedure:PAtCargaHoraria [calls_procedure_inferred|xml]
│   └── Procedure:PCalFrequenciaAvaCon [calls_procedure|index]
├── Procedure:PAtualizaDistanciaGoogleTurma [calls_procedure|index]
│   └── Procedure:PAtualizaDistanciaGoogle [calls_procedure|index]
├── Procedure:PAtualizaDistanciaGoogleTurma [calls_procedure_inferred|xml]
│   └── Procedure:PAtualizaDistanciaGoogle [calls_procedure|index]
├── Procedure:PAtualizaNotaFalta [calls_procedure_inferred|xml]
│   ├── Procedure:PAplicaFormula [calls_procedure|index]
│   │   ├── Procedure:PCalExp [calls_procedure|index]
│   │   └── Procedure:PCalculaExameFinalProficiencia [calls_procedure|index]
│   ├── Procedure:PAplicaFormulacRecDiarioElet [calls_procedure|index]
│   │   ├── Procedure:PAplicaFormula [calls_procedure|index]
│   │   │   ├── Procedure:PCalExp [calls_procedure|index]
│   │   │   └── Procedure:PCalculaExameFinalProficiencia [calls_procedure|index]
│   │   └── Procedure:PCalExp [calls_procedure|index]
│   ├── Procedure:PCalFrequenciaAvaCon [calls_procedure|index]
│   ├── Procedure:PCalFrequenciaAvaDes [calls_procedure|index]
│   ├── Procedure:PCalFrequenciaAvaNum [calls_procedure|index]
│   ├── Procedure:PGrSituacaoCursoAluno [calls_procedure|index]
│   └── Procedure:PVerAvaliacaoNE [calls_procedure|index]
├── Procedure:PBuscaProfessorRegente [calls_procedure|index]
├── Procedure:PBuscaProfessorRegente [calls_procedure_inferred|xml]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PContaAtestadoVaga [calls_procedure|index]
│   └── Procedure:PContaDiasNaoUteis [calls_procedure|index]
├── Procedure:PContaAtestadoVaga [calls_procedure_inferred|xml]
│   └── Procedure:PContaDiasNaoUteis [calls_procedure|index]
├── Procedure:PDeAlunoQVparaAluno [calls_procedure|index]
│   └── Procedure:PImpAlunoMatOnline [calls_procedure|index]
├── Procedure:PDeAlunoQVparaAluno [calls_procedure_inferred|xml]
│   └── Procedure:PImpAlunoMatOnline [calls_procedure|index]
├── Procedure:PDeAlunoparaAlunoQV [calls_procedure|index]
│   └── Procedure:PDeALUNOparaQVALUNO [calls_procedure|index]
├── Procedure:PDeAlunoparaAlunoQV [calls_procedure_inferred|xml]
│   └── Procedure:PDeALUNOparaQVALUNO [calls_procedure|index]
├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── Procedure:PDescricaoEtapaNova [calls_procedure_inferred|xml]
├── Transaction:TTurma1 [calls_transaction_inferred|xml]
├── Transaction:TTurma2 [calls_transaction_inferred|xml]
├── Transaction:TTurmaRep [calls_transaction_inferred|xml]
├── WebPanel:HEnviarEmailEscola [calls_webpanel_inferred|xml]
│   └── Procedure:PParametrosEmailServidor [calls_procedure|index]
├── WebPanel:HEnviarEmailTurma [calls_webpanel_inferred|xml]
│   └── Procedure:PParametrosEmailServidor [calls_procedure|index]
├── WebPanel:HEnviarNotificacaoEscola [calls_webpanel_inferred|xml]
│   └── Procedure:PGravaHistoricoNotificacao [calls_procedure|index]
├── WebPanel:HEnviarSMSEscola [calls_webpanel_inferred|xml]
├── WebPanel:HEnviarSMSTurma [calls_webpanel_inferred|xml]
├── WebPanel:HIncluiDisciplinaTurma [calls_webpanel_inferred|xml]
├── WebPanel:HSelTurmaDocumento [calls_webpanel_inferred|xml]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── WebPanel:HTurmaDisciplinaHorario [calls_webpanel_inferred|xml]
│   ├── Procedure:PAtualizaTurmaDisciplinaHorario [calls_procedure|index]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── WebPanel:HTurmaMudancaRemotoPresencial [calls_webpanel_inferred|xml]
│   ├── Procedure:PAlteraSituacao [calls_procedure|index]
│   │   └── Procedure:PHistoricoMovimentacao [calls_procedure|index]
│   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   ├── Procedure:PGravaAdmLog [calls_procedure|index]
│   ├── Procedure:PMoveDiarioEletronico [calls_procedure|index]
│   └── Procedure:PTurmaAulaPresencial [calls_procedure|index]
└── WebPanel:HUeMatriz [calls_webpanel_inferred|xml]
    └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
```
