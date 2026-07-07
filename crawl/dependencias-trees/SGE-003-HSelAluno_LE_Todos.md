# SGE-003 - Crianças da Lista de Espera - Ano de 2026

- Prioridade: P1
- Modulo: Lista de Inscrição
- Menu: Lista de Inscrição (home)
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hselaluno_le_todos.aspx
- WebPanel KB: `HSelAluno_LE_Todos`
- Tier conversao: **XL**
- Estimativa API: 19-30 dias
- Estimativa Frontend: 20-35 dias
- Risco: alto

## Metricas tecnicas

- Dependencias Procedure: 35
- Dependencias WebPanel: 14
- Dependencias Transaction: 5
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 39
- Subs: 11
- grid.Load: 1
- Transaction.Call (suplemento XML): 8

## Arvore completa

```text
WebPanel:HSelAluno_LE_Todos [raiz]
├── Procedure:PAtualizarEnturmacaoLEI [calls_procedure|index]
├── Procedure:PAtualizarEnturmacaoLEI [calls_procedure_inferred|xml]
├── Procedure:PConsultaEnturmacaoAluno [calls_procedure|index]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── Procedure:PConsultaEnturmacaoAluno [calls_procedure_inferred|xml]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── Procedure:PConsultaMostra [calls_procedure_udp_inferred|xml]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PCorrigirIrmaosLE [calls_procedure|index]
├── Procedure:PCorrigirIrmaosLE [calls_procedure_inferred|xml]
├── Procedure:PDeAlunoparaAlunoLE [calls_procedure|index]
├── Procedure:PDeAlunoparaAlunoLE [calls_procedure_inferred|xml]
├── Procedure:PGravaAdmLog [calls_procedure|index]
├── Procedure:PGravaAdmLog [calls_procedure_inferred|xml]
├── Transaction:TAlunoAtend_LE8183_2016 [calls_transaction_inferred|xml]
├── Transaction:TAlunoDesist_LE [calls_transaction_inferred|xml]
├── Transaction:TAlunoDesist_LE8105 [calls_transaction_inferred|xml]
├── Transaction:TAlunoSituacao_LE8105 [calls_transaction_inferred|xml]
├── Transaction:TAluno_LE_Todos [calls_transaction_inferred|xml]
├── WebPanel:HAlunoLE_Inclui_Todos [calls_webpanel_inferred|xml]
│   ├── Procedure:PAlteraGrupoTurma_LE [calls_procedure|index]
│   ├── Procedure:PAtualizaEscolhasAluno_LE_8183 [calls_procedure|index]
│   ├── Procedure:PConsultaEnturmacaoAlunoLE [calls_procedure|index]
│   ├── Procedure:PDadosUltimaInscricao_LE [calls_procedure|index]
│   ├── Procedure:PGravaAdmLog [calls_procedure|index]
│   ├── Procedure:PIncluiAluno_LE_Todos [calls_procedure|index]
│   │   ├── Procedure:PGravaAdmLog [calls_procedure|index]
│   │   └── Procedure:PIncluiAlunoCPF [calls_procedure|index]
│   │       ├── Procedure:PAtualizaPessoaAluno [calls_procedure|index]
│   │       └── Procedure:PRemoveCaracterEspecial [calls_procedure|index]
│   └── Procedure:PPesCPFAluno [calls_procedure|index]
├── WebPanel:HClassificacao_OrdemChegada [calls_webpanel_inferred|xml]
│   ├── Procedure:PClassificaAlunoUE_OrdemChegada [calls_procedure|index]
│   │   └── SDT:Sdt_RelLE [uses_resolved_custom_type|index]
│   ├── Procedure:PClassificaLEI_OrdemChegada7493 [calls_procedure|index]
│   │   └── SDT:Sdt_RelLE [uses_resolved_custom_type|index]
│   ├── Procedure:PClassificaLEI_OrdemChegada8105 [calls_procedure|index]
│   ├── Procedure:PClassifica_OrdemChegada2018_8259 [calls_procedure|index]
│   │   └── SDT:Sdt_RelLE [uses_resolved_custom_type|index]
│   ├── Procedure:PClassifica_OrdemChegada_8053 [calls_procedure|index]
│   │   └── SDT:Sdt_RelLE [uses_resolved_custom_type|index]
│   ├── Procedure:PClassifica_OrdemChegada_8147 [calls_procedure|index]
│   │   └── SDT:Sdt_RelLE [uses_resolved_custom_type|index]
│   ├── Procedure:PClassifica_OrdemChegada_8183 [calls_procedure|index]
│   │   └── SDT:Sdt_RelLE [uses_resolved_custom_type|index]
│   ├── Procedure:PClassifica_OrdemChegada_8259 [calls_procedure|index]
│   │   └── SDT:Sdt_RelLE [uses_resolved_custom_type|index]
│   └── Procedure:PGravaAdmLog [calls_procedure|index]
├── WebPanel:HConfirmaInscricaoAlunoLE [calls_webpanel_inferred|xml]
│   ├── Procedure:PAtualizaEnvioEmailAlunoLE [calls_procedure|index]
│   ├── Procedure:PConfirmaInscricaoAlunoLE [calls_procedure|index]
│   │   └── Procedure:PGravaAdmLog [calls_procedure|index]
│   ├── Procedure:PDeAlunoparaAlunoLE [calls_procedure|index]
│   ├── Procedure:PEnviarEmailWS [calls_procedure|index]
│   └── Procedure:PParametrosEmailServidor [calls_procedure|index]
├── WebPanel:HEnturmaListaInfantil [calls_webpanel_inferred|xml]
│   └── Procedure:PConsultaEnturmacaoAluno [calls_procedure|index]
│       └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── WebPanel:HEnturmaListaInfantilPre [calls_webpanel_inferred|xml]
│   └── Procedure:PConsultaEnturmacaoAluno [calls_procedure|index]
│       └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── WebPanel:HEnvioSMSAlunoLE [calls_webpanel_inferred|xml]
├── WebPanel:HEnvioSMSAlunoLEAgenda [calls_webpanel_inferred|xml]
│   └── Procedure:PEnvioSMSAlunoAgenda [calls_procedure|index]
├── WebPanel:HExcluiSelecionaAlunoLE [calls_webpanel_inferred|xml]
│   └── Procedure:PExcluiSelecionaAlunoLE [calls_procedure|index]
│       └── Procedure:PGravaAdmLog [calls_procedure|index]
├── WebPanel:HMostraLogs [calls_webpanel_inferred|xml]
├── WebPanel:HSelAlunoDocumentos [calls_webpanel_inferred|xml]
│   └── Procedure:PObterURL [calls_procedure|index]
├── WebPanel:HSelAlunoDocumentosInscricao [calls_webpanel_inferred|xml]
├── WebPanel:HSelAluno_LE_Todos [calls_webpanel_inferred|xml] (ciclo)
├── WebPanel:HSelOcorrencias_LE [calls_webpanel_inferred|xml]
├── WebPanel:HSelecionaAlunoLEComplementar [calls_webpanel_inferred|xml]
│   ├── Procedure:PClassificacaoLEI8105L2 [calls_procedure|index]
│   │   └── Procedure:PClassificacaoLEI8105 [calls_procedure|index]
│   └── Procedure:PSelecionaAlunoLE [calls_procedure|index]
│       └── Procedure:PGravaAdmLog [calls_procedure|index]
└── WebPanel:HSelecionaManJudAlunoLE [calls_webpanel_inferred|xml]
    └── Procedure:PSelecionaAlunoLE [calls_procedure|index]
        └── Procedure:PGravaAdmLog [calls_procedure|index]
```
