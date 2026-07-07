# SGE-023 - Lista de Espera Projetos - Ano de 2026

- Prioridade: P1
- Modulo: Secretaria Educação
- Menu: Trabalhar com Estudantes > Lista Espera Projetos
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelAlunoListaEsperaProjetos.aspx
- WebPanel KB: `HSelAlunoListaEsperaProjetos`
- Tier conversao: **L**
- Estimativa API: 11-18 dias
- Estimativa Frontend: 12-20 dias
- Risco: medio

## Metricas tecnicas

- Dependencias Procedure: 12
- Dependencias WebPanel: 4
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 20
- Subs: 5
- grid.Load: 1
- Transaction.Call (suplemento XML): 3

## Arvore completa

```text
WebPanel:HSelAlunoListaEsperaProjetos [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── Procedure:PDescricaoEtapaNova [calls_procedure_inferred|xml]
├── Transaction:TAlunoListaProjetos [calls_transaction_inferred|xml]
├── WebPanel:HAlunoListaProjetos [calls_webpanel_inferred|xml]
│   ├── Procedure:PBuscaCursoMatriz [calls_procedure|index]
│   └── Procedure:PGravaAlunoListaProjetos [calls_procedure|index]
│       └── Procedure:PGravaAdmLog [calls_procedure|index]
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
└── WebPanel:HSelAlunoListaEsperaProjetos [calls_webpanel_inferred|xml] (ciclo)
```
