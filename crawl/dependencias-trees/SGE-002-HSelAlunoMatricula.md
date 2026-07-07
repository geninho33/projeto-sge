# SGE-002 - Estudantes da Matrícula

- Prioridade: P1
- Modulo: Matrícula On-Line
- Menu: Trabalhar com Matrículas > Alunos
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelAlunoMatricula.aspx
- WebPanel KB: `HSelAlunoMatricula`
- Tier conversao: **XL**
- Estimativa API: 19-30 dias
- Estimativa Frontend: 20-35 dias
- Risco: alto

## Metricas tecnicas

- Dependencias Procedure: 26
- Dependencias WebPanel: 11
- Dependencias Transaction: 0
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 24
- Subs: 5
- grid.Load: 1
- Transaction.Call (suplemento XML): 0

## Arvore completa

```text
WebPanel:HSelAlunoMatricula [raiz]
├── Procedure:PBuscaNomeUE [calls_procedure|index]
├── Procedure:PBuscaNomeUE [calls_procedure_inferred|xml]
├── Procedure:PConsultaMostra [calls_procedure_udp_inferred|xml]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── Procedure:PDescricaoEtapaNova [calls_procedure_inferred|xml]
├── Procedure:PGravaAdmLog [calls_procedure|index]
├── Procedure:PGravaAdmLog [calls_procedure_inferred|xml]
├── Procedure:PIncluiRematricula [calls_procedure_inferred|xml]
├── Procedure:PObterURL [calls_procedure|index]
├── Procedure:PObterURL [calls_procedure_inferred|xml]
├── Procedure:PParametrosExternoPM [calls_procedure|index]
├── Procedure:PParametrosExternoPM [calls_procedure_inferred|xml]
├── Procedure:PPesAlu2 [calls_procedure|index]
├── Procedure:PPesAlu2 [calls_procedure_inferred|xml]
├── Procedure:RFichaMatInf8335PDF [calls_procedure|index]
│   ├── Procedure:PCgcCpf [calls_procedure|index]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── Procedure:RFichaMatInf8335PDF [calls_procedure_inferred|xml]
│   ├── Procedure:PCgcCpf [calls_procedure|index]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── Procedure:RFichaMatricula8075PDF [calls_procedure|index]
│   ├── Procedure:PCgcCpf [calls_procedure|index]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── Procedure:RFichaMatricula8075PDF [calls_procedure_inferred|xml]
│   ├── Procedure:PCgcCpf [calls_procedure|index]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── Procedure:RFichaMatricula8253PDF [calls_procedure|index]
│   ├── Procedure:PCgcCpf [calls_procedure|index]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── Procedure:RFichaMatricula8253PDF [calls_procedure_inferred|xml]
│   ├── Procedure:PCgcCpf [calls_procedure|index]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── Procedure:RMOLFichaPDF [calls_procedure|index]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── Procedure:RMOLFichaPDF [calls_procedure_inferred|xml]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── Procedure:RRFichaMatEF8105PDF [calls_procedure|index]
│   ├── Procedure:PCgcCpf [calls_procedure|index]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── Procedure:RRFichaMatEF8105PDF [calls_procedure_inferred|xml]
│   ├── Procedure:PCgcCpf [calls_procedure|index]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── Procedure:RRFichaMatEF8105PDF_DarcyRibeiro [calls_procedure|index]
│   ├── Procedure:PCgcCpf [calls_procedure|index]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── Procedure:RRFichaMatEF8105PDF_DarcyRibeiro [calls_procedure_inferred|xml]
│   ├── Procedure:PCgcCpf [calls_procedure|index]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── WebPanel:HAlunoExtra [calls_webpanel_inferred|xml]
│   ├── Procedure:PAlteraAlunoCPF [calls_procedure|index]
│   │   ├── Procedure:PAtualizaPessoaAluno [calls_procedure|index]
│   │   │   └── Procedure:PGravaAdmLog [calls_procedure|index]
│   │   └── Procedure:PRemoveCaracterEspecial [calls_procedure|index]
│   ├── Procedure:PCalculaDigitoMatricula [calls_procedure|index]
│   ├── Procedure:PGravaAdmLog [calls_procedure|index]
│   ├── Procedure:PIncluiAlunoCPF [calls_procedure|index]
│   │   ├── Procedure:PAtualizaPessoaAluno [calls_procedure|index]
│   │   │   └── Procedure:PGravaAdmLog [calls_procedure|index]
│   │   └── Procedure:PRemoveCaracterEspecial [calls_procedure|index]
│   ├── Procedure:PPesCPFAluno [calls_procedure|index]
│   └── Procedure:PRemoveCaracterEspecial [calls_procedure|index]
├── WebPanel:HAlunoMIQVExclui [calls_webpanel_inferred|xml]
│   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   └── Procedure:PGravaAdmLog [calls_procedure|index]
├── WebPanel:HAlunoMQVAltera [calls_webpanel_inferred|xml]
│   ├── Procedure:PAlteraNomeAluno [calls_procedure|index]
│   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   ├── Procedure:PGravaAdmLog [calls_procedure|index]
│   ├── Procedure:PIdadeDataCorte [calls_procedure|index]
│   └── Procedure:PIncluiAluno [calls_procedure|index]
│       └── Procedure:PIncluiAlunoLog [calls_procedure|index]
│           └── Procedure:PGravaAdmLog [calls_procedure|index]
├── WebPanel:HAlunoMQVAlteraSituacao [calls_webpanel_inferred|xml]
│   ├── Procedure:PAlteraNomeAluno [calls_procedure|index]
│   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   ├── Procedure:PGravaAdmLog [calls_procedure|index]
│   ├── Procedure:PIdadeDataCorte [calls_procedure|index]
│   └── Procedure:PIncluiAluno [calls_procedure|index]
│       └── Procedure:PIncluiAlunoLog [calls_procedure|index]
│           └── Procedure:PGravaAdmLog [calls_procedure|index]
├── WebPanel:HAlunoMQVConfirmar [calls_webpanel_inferred|xml]
│   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   └── Procedure:PGravaAdmLog [calls_procedure|index]
├── WebPanel:HAlunoMQVExclui [calls_webpanel_inferred|xml]
│   └── Procedure:PGravaAdmLog [calls_procedure|index]
├── WebPanel:HEnturmaMatriculaOnLine [calls_webpanel_inferred|xml]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── WebPanel:HEnturmaMatriculaTransfInterna [calls_webpanel_inferred|xml]
│   └── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── WebPanel:HMostraLogs [calls_webpanel_inferred|xml]
├── WebPanel:HSelAcessoPublico [calls_webpanel_inferred|xml]
├── WebPanel:HSelAlunoDocumentos [calls_webpanel_inferred|xml]
│   └── Procedure:PObterURL [calls_procedure|index]
└── WebPanel:HSelAlunoMatricula [calls_webpanel_inferred|xml] (ciclo)
```
