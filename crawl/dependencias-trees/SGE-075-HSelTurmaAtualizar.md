# SGE-075 - Atualização de dados por turma

- Prioridade: P2
- Modulo: Secretaria Educação
- Menu: Trabalhar com Estudantes > Atualizar
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelTurmaAtualizar.aspx
- WebPanel KB: `HSelTurmaAtualizar`
- Tier conversao: **XL**
- Estimativa API: 19-30 dias
- Estimativa Frontend: 20-35 dias
- Risco: medio

## Metricas tecnicas

- Dependencias Procedure: 34
- Dependencias WebPanel: 18
- Dependencias Transaction: 0
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 29
- Subs: 4
- grid.Load: 1
- Transaction.Call (suplemento XML): 0

## Arvore completa

```text
WebPanel:HSelTurmaAtualizar [raiz]
├── Procedure:PAtualizaTurRetiraCenso [calls_procedure|index]
├── Procedure:PAtualizaTurRetiraCenso [calls_procedure_inferred|xml]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── Procedure:PDescricaoEtapaNova [calls_procedure_inferred|xml]
├── WebPanel:HAtualizaAlimentacaoEscolar [calls_webpanel_inferred|xml]
│   ├── Procedure:PAtualizaAlimentacaoEscolar [calls_procedure|index]
│   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   └── Procedure:PInclui_DeALUNOparaQVALUNO [calls_procedure|index]
├── WebPanel:HAtualizaAnexosEstudantes [calls_webpanel_inferred|xml]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── WebPanel:HAtualizaAulaPresencial [calls_webpanel_inferred|xml]
│   ├── Procedure:PAtualizaAulaPresencial [calls_procedure|index]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── WebPanel:HAtualizaCadastroEmpresa [calls_webpanel_inferred|xml]
│   ├── Procedure:PAtualizaCadastroEmpresa [calls_procedure|index]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── WebPanel:HAtualizaDataMatricula [calls_webpanel_inferred|xml]
│   ├── Procedure:PAtualizaCorRaca [calls_procedure|index]
│   ├── Procedure:PAtualizaDataMatricula [calls_procedure|index]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── WebPanel:HAtualizaEnderecoEstudantes [calls_webpanel_inferred|xml]
│   ├── Procedure:PAtualizaEnderecoEstudantes [calls_procedure|index]
│   ├── Procedure:PAtualizaLatitudeLongitude [calls_procedure|index]
│   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   └── Procedure:PInclui_DeALUNOparaQVALUNO [calls_procedure|index]
├── WebPanel:HAtualizaEsquemaVacinal [calls_webpanel_inferred|xml]
│   ├── Procedure:PAtualizaEsquemaVacinal [calls_procedure|index]
│   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   └── Procedure:PInclui_DeALUNOparaQVALUNO [calls_procedure|index]
├── WebPanel:HAtualizaFotoEstudantes [calls_webpanel_inferred|xml]
│   ├── Procedure:PAtualizaAlunoFoto [calls_procedure|index]
│   ├── Procedure:PAtualizaUsoImagem [calls_procedure|index]
│   ├── Procedure:PBuscarFotoAluno [calls_procedure|index]
│   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   └── Procedure:PExcluirFotoAluno [calls_procedure|index]
├── WebPanel:HAtualizaRFID [calls_webpanel_inferred|xml]
│   ├── Procedure:PAtualizaRFID [calls_procedure|index]
│   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   └── Procedure:PInclui_DeALUNOparaQVALUNO [calls_procedure|index]
├── WebPanel:HAtualizaReligiaoBilingue [calls_webpanel_inferred|xml]
│   ├── Procedure:PAtualizaReligiaoBilingue [calls_procedure|index]
│   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   └── Procedure:PInclui_DeALUNOparaQVALUNO [calls_procedure|index]
├── WebPanel:HAtualizaRespEmpresaTrabalha [calls_webpanel_inferred|xml]
│   ├── Procedure:PAtualizaEmpTrabalhaPais [calls_procedure|index]
│   ├── Procedure:PAtualizaRespEmpTrabalha [calls_procedure|index]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── WebPanel:HAtualizaSUS [calls_webpanel_inferred|xml]
│   ├── Procedure:PAtualizaAlunoTurmaCenso [calls_procedure|index]
│   ├── Procedure:PAtualizaBolsaFamilia [calls_procedure|index]
│   ├── Procedure:PAtualizaSUS [calls_procedure|index]
│   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   └── Procedure:PInclui_DeALUNOparaQVALUNO [calls_procedure|index]
├── WebPanel:HAtualizaTelefones [calls_webpanel_inferred|xml]
│   ├── Procedure:PAtualizaTelefones [calls_procedure|index]
│   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   └── Procedure:PInclui_DeALUNOparaQVALUNO [calls_procedure|index]
├── WebPanel:HAtualizaUniformeEscolar [calls_webpanel_inferred|xml]
│   ├── Procedure:PAtualizaUniformeEscolarTurma [calls_procedure|index]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── WebPanel:HAtualizaZonaMoradia_DistUE [calls_webpanel_inferred|xml]
│   ├── Procedure:PAtualizaLatitudeLongitude [calls_procedure|index]
│   ├── Procedure:PAtualizaLinhaOnibus [calls_procedure|index]
│   ├── Procedure:PAtualizaLocalizacaoAluno [calls_procedure|index]
│   ├── Procedure:PAtualizaSeloCracha [calls_procedure|index]
│   ├── Procedure:PAtualizarZonaMoradia_DistUE [calls_procedure|index]
│   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   └── Procedure:PInclui_DeALUNOparaQVALUNO [calls_procedure|index]
├── WebPanel:HSelAcuidade [calls_webpanel_inferred|xml]
│   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   ├── Procedure:PGravaAcuidade [calls_procedure|index]
│   └── Procedure:RTUR041 [calls_procedure|index]
│       └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── WebPanel:HSelBiometria [calls_webpanel_inferred|xml]
│   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   └── Procedure:PGravaMedidas [calls_procedure|index]
│       └── Procedure:PGravaAdmLog [calls_procedure|index]
└── WebPanel:HSelRecemNascido [calls_webpanel_inferred|xml]
    ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
    └── Procedure:RTUR042 [calls_procedure|index]
        └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
```
