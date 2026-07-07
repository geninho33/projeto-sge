# SGE-070 - Turmas para Enturmação

- Prioridade: P2
- Modulo: Secretaria Educação
- Menu: Trabalhar com Turmas > Enturmar
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelEnturmaCompleto.aspx
- WebPanel KB: `HSelEnturmaCompleto`
- Tier conversao: **XL**
- Estimativa API: 19-30 dias
- Estimativa Frontend: 20-35 dias
- Risco: medio

## Metricas tecnicas

- Dependencias Procedure: 29
- Dependencias WebPanel: 8
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 17
- Subs: 4
- grid.Load: 1
- Transaction.Call (suplemento XML): 1

## Arvore completa

```text
WebPanel:HSelEnturmaCompleto [raiz]
├── Procedure:PBuscaProfessorRegente [calls_procedure|index]
├── Procedure:PBuscaProfessorRegente [calls_procedure_inferred|xml]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PContaAtestadoVaga [calls_procedure_inferred|xml]
│   └── Procedure:PContaDiasNaoUteis [calls_procedure|index]
├── Procedure:PContaDiasNaoUteis [calls_procedure|index]
├── Procedure:PContaDiasNaoUteis [calls_procedure_inferred|xml]
├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── Procedure:PDescricaoEtapaNova [calls_procedure_inferred|xml]
├── Transaction:TEnturma_w [calls_transaction_inferred|xml]
├── WebPanel:HProfessoresTurmaPopUp [calls_webpanel|index]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── WebPanel:HSelAlunoTurma [calls_webpanel_inferred|xml]
│   ├── Procedure:PAlteraAluCensoEnviado [calls_procedure|index]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── WebPanel:HSelEnturmaAlunoCad [calls_webpanel_inferred|xml]
│   ├── Procedure:PAlteraStatusLE [calls_procedure|index]
│   ├── Procedure:PConsultaEnturmacaoAlunoRegular [calls_procedure|index]
│   │   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   ├── Procedure:PGravaAdmLog [calls_procedure|index]
│   ├── Procedure:PIncluiEnturma [calls_procedure|index]
│   │   ├── Procedure:PAtualizaAulaCovid [calls_procedure|index]
│   │   ├── Procedure:PBaixaAtestadoVaga [calls_procedure|index]
│   │   ├── Procedure:PBaixaListasEspera [calls_procedure|index]
│   │   ├── Procedure:PConsultaEstudanteNovo [calls_procedure|index]
│   │   │   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   │   ├── Procedure:PHistoricoMovimentacao [calls_procedure|index]
│   │   └── Procedure:PPesquisaLiberacoesUsuario [calls_procedure|index]
│   ├── Procedure:PPesquisaLiberacoesUsuario [calls_procedure|index]
│   ├── Procedure:PVerNrEnturmacoes [calls_procedure|index]
│   ├── Procedure:PVerTemLEI [calls_procedure|index]
│   └── Procedure:PVerTipoEnturmacoes [calls_procedure|index]
├── WebPanel:HSelEnturmaAnosAnt [calls_webpanel_inferred|xml]
│   ├── Procedure:PConsultaEnturmacaoAlunoRegular [calls_procedure|index]
│   │   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   ├── Procedure:PGravaAdmLog [calls_procedure|index]
│   ├── Procedure:PIncluiEnturma [calls_procedure|index]
│   │   ├── Procedure:PAtualizaAulaCovid [calls_procedure|index]
│   │   ├── Procedure:PBaixaAtestadoVaga [calls_procedure|index]
│   │   ├── Procedure:PBaixaListasEspera [calls_procedure|index]
│   │   ├── Procedure:PConsultaEstudanteNovo [calls_procedure|index]
│   │   │   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   │   ├── Procedure:PHistoricoMovimentacao [calls_procedure|index]
│   │   └── Procedure:PPesquisaLiberacoesUsuario [calls_procedure|index]
│   ├── Procedure:PVerNrEnturmacoes [calls_procedure|index]
│   └── Procedure:PVerTipoEnturmacoes [calls_procedure|index]
├── WebPanel:HSelEnturmaListaEsperaInfantil [calls_webpanel_inferred|xml]
│   ├── Procedure:PAlteraStatusLE [calls_procedure|index]
│   ├── Procedure:PAlteraStatusLE8259 [calls_procedure|index]
│   ├── Procedure:PAlunoLE_to_Aluno [calls_procedure|index]
│   │   ├── Procedure:PAtualizaHorarioTrabalhoResponsavel [calls_procedure|index]
│   │   ├── Procedure:PAtualizaRespLegal [calls_procedure|index]
│   │   └── Procedure:PDeALUNOparaQVALUNO [calls_procedure|index]
│   ├── Procedure:PAtualizaStatus_LE [calls_procedure|index]
│   ├── Procedure:PConsultaEnturmacaoAlunoLE [calls_procedure|index]
│   ├── Procedure:PConsultaEnturmacaoAlunoRegular [calls_procedure|index]
│   │   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   ├── Procedure:PGravaAdmLog [calls_procedure|index]
│   ├── Procedure:PIncluiEnturma [calls_procedure|index]
│   │   ├── Procedure:PAtualizaAulaCovid [calls_procedure|index]
│   │   ├── Procedure:PBaixaAtestadoVaga [calls_procedure|index]
│   │   ├── Procedure:PBaixaListasEspera [calls_procedure|index]
│   │   ├── Procedure:PConsultaEstudanteNovo [calls_procedure|index]
│   │   │   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   │   ├── Procedure:PHistoricoMovimentacao [calls_procedure|index]
│   │   └── Procedure:PPesquisaLiberacoesUsuario [calls_procedure|index]
│   ├── Procedure:PVerConvenioUE [calls_procedure|index]
│   ├── Procedure:PVerNrEnturmacoes [calls_procedure|index]
│   └── Procedure:PVerTipoEnturmacoes [calls_procedure|index]
├── WebPanel:HSelEnturmaMatriculaOnline [calls_webpanel_inferred|xml]
│   ├── Procedure:PAlteraStatusLE [calls_procedure|index]
│   ├── Procedure:PConsultaEnturmacaoAluno [calls_procedure|index]
│   │   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   ├── Procedure:PGravaAdmLog [calls_procedure|index]
│   ├── Procedure:PImpAlunoMatOnline [calls_procedure|index]
│   ├── Procedure:PIncluiEnturma [calls_procedure|index]
│   │   ├── Procedure:PAtualizaAulaCovid [calls_procedure|index]
│   │   ├── Procedure:PBaixaAtestadoVaga [calls_procedure|index]
│   │   ├── Procedure:PBaixaListasEspera [calls_procedure|index]
│   │   ├── Procedure:PConsultaEstudanteNovo [calls_procedure|index]
│   │   │   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   │   ├── Procedure:PHistoricoMovimentacao [calls_procedure|index]
│   │   └── Procedure:PPesquisaLiberacoesUsuario [calls_procedure|index]
│   ├── Procedure:PVerNrEnturmacoes [calls_procedure|index]
│   └── Procedure:PVerTipoEnturmacoes [calls_procedure|index]
├── WebPanel:HSelEnturmaSemAnt [calls_webpanel_inferred|xml]
│   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   ├── Procedure:PGravaAdmLog [calls_procedure|index]
│   └── Procedure:PIncluiEnturma [calls_procedure|index]
│       ├── Procedure:PAtualizaAulaCovid [calls_procedure|index]
│       ├── Procedure:PBaixaAtestadoVaga [calls_procedure|index]
│       ├── Procedure:PBaixaListasEspera [calls_procedure|index]
│       ├── Procedure:PConsultaEstudanteNovo [calls_procedure|index]
│       │   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│       ├── Procedure:PHistoricoMovimentacao [calls_procedure|index]
│       └── Procedure:PPesquisaLiberacoesUsuario [calls_procedure|index]
└── WebPanel:HSelTurmaEnturmaProjeto [calls_webpanel_inferred|xml]
    └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
```
