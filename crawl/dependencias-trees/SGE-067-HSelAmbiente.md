# SGE-067 - Cadastro de Ambientes

- Prioridade: P2
- Modulo: Ambiente Escolar
- Menu: Ambientes da UE > Da Unidade Escolar
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HSelAmbiente.aspx
- WebPanel KB: `HSelAmbiente`
- Tier conversao: **L**
- Estimativa API: 11-18 dias
- Estimativa Frontend: 12-20 dias
- Risco: medio

## Metricas tecnicas

- Dependencias Procedure: 68
- Dependencias WebPanel: 2
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 15
- Subs: 1
- grid.Load: 1
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelAmbiente [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Transaction:TUeAmbiente [calls_transaction_inferred|xml]
├── WebPanel:HCensoAtualizaDados [calls_webpanel_inferred|xml]
│   ├── Procedure:PAtualizaTabelaDistrito [calls_procedure|index]
│   ├── Procedure:PAtualizaTabelaNac [calls_procedure|index]
│   ├── Procedure:PAtualizaTabelaPais [calls_procedure|index]
│   ├── Procedure:PBuscaNomeSigUE [calls_procedure|index]
│   ├── Procedure:PBuscaNomeUE [calls_procedure|index]
│   ├── Procedure:PGeraCenso00 [calls_procedure|index]
│   │   ├── Procedure:PBuscaDataCalendarioCenso [calls_procedure|index]
│   │   ├── Procedure:PCriticaCaracteresEsp [calls_procedure|index]
│   │   ├── Procedure:PRemoveCaracterEsp2 [calls_procedure|index]
│   │   ├── Procedure:PValidaBairro [calls_procedure|index]
│   │   ├── Procedure:PValidaComplemento [calls_procedure|index]
│   │   ├── Procedure:PValidaDDD [calls_procedure|index]
│   │   ├── Procedure:PValidaEmail [calls_procedure|index]
│   │   ├── Procedure:PValidaEndereco [calls_procedure|index]
│   │   ├── Procedure:PValidaLocalizacaoDiferenciada [calls_procedure|index]
│   │   ├── Procedure:PValidaNome [calls_procedure|index]
│   │   ├── Procedure:PValidaOrgaoVinculado [calls_procedure|index]
│   │   └── Procedure:PValidaTelefone [calls_procedure|index]
│   │       ├── Procedure:PCriticaCaracteresEsp [calls_procedure|index]
│   │       ├── Procedure:PCriticaCaracteresRep [calls_procedure|index]
│   │       ├── Procedure:PRemoveCaracterEsp2 [calls_procedure|index]
│   │       └── Procedure:PValidaDDD [calls_procedure|index]
│   ├── Procedure:PGeraCenso10 [calls_procedure|index]
│   │   ├── Procedure:PBuscaDataCenso [calls_procedure|index]
│   │   ├── Procedure:PBuscaSalasAulasUsadas [calls_procedure|index]
│   │   │   └── Procedure:PDescricaoTurma [calls_procedure|index]
│   │   ├── Procedure:PValidaFormaOcup [calls_procedure|index]
│   │   ├── Procedure:PValidaLocalFunc [calls_procedure|index]
│   │   └── Procedure:PValidaUECompartilhada [calls_procedure|index]
│   │       └── Procedure:PBuscaUECompartilhada [calls_procedure|index]
│   ├── Procedure:PGeraCenso20 [calls_procedure|index]
│   │   ├── Procedure:PBuscaAlunonaDisc [calls_procedure|index]
│   │   ├── Procedure:PBuscaAlunonoPeriodo [calls_procedure|index]
│   │   ├── Procedure:PBuscaDataCenso [calls_procedure|index]
│   │   ├── Procedure:PBuscaEtapaMec [calls_procedure|index]
│   │   ├── Procedure:PBuscaProfdaDisc [calls_procedure|index]
│   │   ├── Procedure:PBuscaTemProfnaTurma [calls_procedure|index]
│   │   ├── Procedure:PContaTurmaMultiseriada [calls_procedure|index]
│   │   ├── Procedure:PPesquisaAlunoTurma [calls_procedure|index]
│   │   ├── Procedure:PValidaAmbienteTurma [calls_procedure|index]
│   │   └── Procedure:PValidaDiasSemanaTurma [calls_procedure|index]
│   │       └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   ├── Procedure:PGeraCenso30 [calls_procedure|index]
│   │   ├── Procedure:PBuscaDataCenso [calls_procedure|index]
│   │   ├── Procedure:PCriticaCaracteresEsp [calls_procedure|index]
│   │   ├── Procedure:PRemoveCaracterEsp2 [calls_procedure|index]
│   │   ├── Procedure:PValidaCPFCNPJ [calls_procedure|index]
│   │   ├── Procedure:PValidaEmail [calls_procedure|index]
│   │   └── Procedure:PValidaNome [calls_procedure|index]
│   ├── Procedure:PGeraCenso40 [calls_procedure|index]
│   │   └── Procedure:PBuscaDataCenso [calls_procedure|index]
│   ├── Procedure:PGeraCenso50 [calls_procedure|index]
│   │   ├── Procedure:PBuscaDataCenso [calls_procedure|index]
│   │   ├── Procedure:PBuscaEtapaMec [calls_procedure|index]
│   │   └── Procedure:PPesquisaAlunoTurma [calls_procedure|index]
│   ├── Procedure:PGeraCenso80 [calls_procedure|index]
│   │   ├── Procedure:PBuscaEtapaMec [calls_procedure|index]
│   │   └── Procedure:PBuscaTipoAtendimentoAluno [calls_procedure|index]
│   ├── Procedure:PGeraCenso90 [calls_procedure|index]
│   ├── Procedure:PGeraCensoIdentificacao [calls_procedure|index]
│   │   ├── Procedure:PBuscaDataCenso [calls_procedure|index]
│   │   ├── Procedure:PCgcCpf [calls_procedure|index]
│   │   └── Procedure:PRemoveCaracterEsp2 [calls_procedure|index]
│   ├── Procedure:PGeraCensoTxt [calls_procedure|index]
│   │   ├── Procedure:PGeraCenso99 [calls_procedure|index]
│   │   │   └── Procedure:PRemoveCaracterEsp2 [calls_procedure|index]
│   │   ├── Procedure:PGeraLinhaCensoAlufSala [calls_procedure|index]
│   │   │   └── Procedure:PRemoveCaracterEsp2 [calls_procedure|index]
│   │   ├── Procedure:PGeraLinhaCensoGestor [calls_procedure|index]
│   │   │   └── Procedure:PRemoveCaracterEsp2 [calls_procedure|index]
│   │   ├── Procedure:PGeraLinhaCensoPessoaFis [calls_procedure|index]
│   │   │   └── Procedure:PRemoveCaracterEsp2 [calls_procedure|index]
│   │   ├── Procedure:PGeraLinhaCensoProfSala [calls_procedure|index]
│   │   │   └── Procedure:PRemoveCaracterEsp2 [calls_procedure|index]
│   │   ├── Procedure:PGeraLinhaCensoReg89 [calls_procedure|index]
│   │   │   └── Procedure:PRemoveCaracterEsp2 [calls_procedure|index]
│   │   ├── Procedure:PGeraLinhaCensoReg90 [calls_procedure|index]
│   │   │   └── Procedure:PRemoveCaracterEsp2 [calls_procedure|index]
│   │   ├── Procedure:PGeraLinhaCensoReg91 [calls_procedure|index]
│   │   │   └── Procedure:PRemoveCaracterEsp2 [calls_procedure|index]
│   │   ├── Procedure:PGeraLinhaCensoTurma [calls_procedure|index]
│   │   │   └── Procedure:PRemoveCaracterEsp2 [calls_procedure|index]
│   │   ├── Procedure:PGeraLinhaCensoUE [calls_procedure|index]
│   │   │   └── Procedure:PRemoveCaracterEsp2 [calls_procedure|index]
│   │   └── Procedure:PGeraLinhaCensoUEEst [calls_procedure|index]
│   │       └── Procedure:PRemoveCaracterEsp2 [calls_procedure|index]
│   ├── Procedure:PGeraGravaCenso89 [calls_procedure|index]
│   │   ├── Procedure:PBuscaDataCenso [calls_procedure|index]
│   │   ├── Procedure:PCriticaCaracteresEsp [calls_procedure|index]
│   │   └── Procedure:PRemoveCaracterEsp2 [calls_procedure|index]
│   ├── Procedure:PGeraGravaCenso91 [calls_procedure|index]
│   │   ├── Procedure:PCriticaCaracteresEsp [calls_procedure|index]
│   │   └── Procedure:PRemoveCaracterEsp2 [calls_procedure|index]
│   ├── Procedure:PObterURL [calls_procedure|index]
│   ├── Procedure:PPesquisaCensoEtapa1 [calls_procedure|index]
│   ├── Procedure:PPesquisaCensoEtapa2 [calls_procedure|index]
│   ├── Procedure:PRCen001_Excel [calls_procedure|index]
│   ├── Procedure:RAluEnviadoCenso2 [calls_procedure|index]
│   └── Procedure:RAluNaoEnviadoCenso2 [calls_procedure|index]
└── WebPanel:HSelAmbienteHistorico [calls_webpanel_inferred|xml]
```
