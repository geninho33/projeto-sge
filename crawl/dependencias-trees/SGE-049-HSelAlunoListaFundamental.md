# SGE-049 - Lista de Intenção de Transferência Fundamental - Ano de 2026

- Prioridade: P2
- Modulo: Secretaria Educação
- Menu: Trabalhar com Estudantes > Lista Espera Fundamental
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelAlunoListaFundamental.aspx
- WebPanel KB: `HSelAlunoListaFundamental`
- Tier conversao: **XL**
- Estimativa API: 19-30 dias
- Estimativa Frontend: 20-35 dias
- Risco: alto

## Metricas tecnicas

- Dependencias Procedure: 25
- Dependencias WebPanel: 12
- Dependencias Transaction: 3
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 24
- Subs: 4
- grid.Load: 1
- Transaction.Call (suplemento XML): 7

## Arvore completa

```text
WebPanel:HSelAlunoListaFundamental [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PVagasTurmaSaldo [calls_procedure|index]
├── Procedure:PVagasTurmaSaldo [calls_procedure_inferred|xml]
├── Transaction:TAlunoAlteraLF8105 [calls_transaction_inferred|xml]
├── Transaction:TAlunoListaFundamental [calls_transaction_inferred|xml]
├── Transaction:TAlunoListaFundamental8327 [calls_transaction_inferred|xml]
├── WebPanel:HAlunoListaFundamental [calls_webpanel_inferred|xml]
│   ├── Procedure:PConsultaEnturmacaoAluno [calls_procedure|index]
│   │   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   ├── Procedure:PDtHrAlunoListaFundamental [calls_procedure|index]
│   ├── Procedure:PGravaAdmLog [calls_procedure|index]
│   ├── Procedure:PGravaAlunoListaFundamental8183 [calls_procedure|index]
│   └── Procedure:PGravaAlunoListaFundamentalLog [calls_procedure|index]
├── WebPanel:HAlunoListaFundamental8105 [calls_webpanel_inferred|xml]
│   ├── Procedure:PAtualizaAutismo [calls_procedure|index]
│   ├── Procedure:PConsultaEnturmacaoAluno [calls_procedure|index]
│   │   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   ├── Procedure:PDtHrAlunoListaFundamental [calls_procedure|index]
│   ├── Procedure:PExcluiAlunoListaFundamental [calls_procedure|index]
│   ├── Procedure:PGravaAdmLog [calls_procedure|index]
│   ├── Procedure:PGravaAlunoListaFundamental8105 [calls_procedure|index]
│   ├── Procedure:PGravaAlunoListaFundamentalLog [calls_procedure|index]
│   ├── Procedure:PGravaIrmaosListaFundamental [calls_procedure|index]
│   └── Procedure:PGravaPrioridadeListaFundamental [calls_procedure|index]
├── WebPanel:HAlunoListaFundamental8183 [calls_webpanel_inferred|xml]
│   ├── Procedure:PAtualizaAutismo [calls_procedure|index]
│   ├── Procedure:PConsultaEnturmacaoAluno [calls_procedure|index]
│   │   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   ├── Procedure:PDtHrAlunoListaFundamental [calls_procedure|index]
│   ├── Procedure:PExcluiAlunoListaFundamental [calls_procedure|index]
│   ├── Procedure:PGravaAdmLog [calls_procedure|index]
│   ├── Procedure:PGravaAlunoListaFundamental8183 [calls_procedure|index]
│   └── Procedure:PGravaAlunoListaFundamentalLog [calls_procedure|index]
├── WebPanel:HAlunoListaFundamental8327 [calls_webpanel_inferred|xml]
│   ├── Procedure:PConsultaEnturmacaoAluno [calls_procedure|index]
│   │   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   ├── Procedure:PDtHrAlunoListaFundamental [calls_procedure|index]
│   ├── Procedure:PGravaAdmLog [calls_procedure|index]
│   ├── Procedure:PGravaAlunoListaFundamental [calls_procedure|index]
│   └── Procedure:PGravaAlunoListaFundamentalLog [calls_procedure|index]
├── WebPanel:HConfirmaInscricaoAlunoLEF_8183 [calls_webpanel_inferred|xml]
│   ├── Procedure:PAtualizaPontosLEF [calls_procedure|index]
│   └── Procedure:PConfirmaInscricaoAlunoLEF [calls_procedure|index]
│       ├── Procedure:PGeraLog [calls_procedure|index]
│       └── Procedure:PGravaAdmLog [calls_procedure|index]
├── WebPanel:HEnturmaListaFundamental [calls_webpanel_inferred|xml]
│   ├── Procedure:PConsultaEnturmacaoAluno [calls_procedure|index]
│   │   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── WebPanel:HIncluiCadastroAluno [calls_webpanel_inferred|xml]
│   ├── Procedure:PAtualizaAutismo [calls_procedure|index]
│   ├── Procedure:PAtualizaPessoaAluno [calls_procedure|index]
│   │   └── Procedure:PGravaAdmLog [calls_procedure|index]
│   ├── Procedure:PDeALUNOparaQVALUNO [calls_procedure|index]
│   ├── Procedure:PGravaAdmLog [calls_procedure|index]
│   ├── Procedure:PIncluiAluno [calls_procedure|index]
│   │   └── Procedure:PIncluiAlunoLog [calls_procedure|index]
│   │       └── Procedure:PGravaAdmLog [calls_procedure|index]
│   ├── Procedure:PIncluiCadastroAlunoCPF [calls_procedure|index]
│   └── Procedure:PPesCPFAluno [calls_procedure|index]
├── WebPanel:HMostraLogs [calls_webpanel_inferred|xml]
├── WebPanel:HSelAlunoDadosLE [calls_webpanel_inferred|xml]
├── WebPanel:HSelAlunoListaFundamentalLog [calls_webpanel_inferred|xml]
├── WebPanel:HSelOcorrencias_LF [calls_webpanel_inferred|xml]
│   └── Procedure:PPesAlu2 [calls_procedure|index]
└── WebPanel:HTelaPerdeuSessaoQV [calls_webpanel_inferred|xml]
    └── Procedure:PObterURL [calls_procedure|index]
```
