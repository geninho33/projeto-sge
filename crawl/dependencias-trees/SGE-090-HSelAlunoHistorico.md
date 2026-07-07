# SGE-090 - Histórico Escolar

- Prioridade: P2
- Modulo: Secretaria Educação
- Menu: Trabalhar com Estudantes > Histórico Escolar
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelAlunoHistorico.aspx
- WebPanel KB: `HSelAlunoHistorico`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: medio

## Metricas tecnicas

- Dependencias Procedure: 8
- Dependencias WebPanel: 1
- Dependencias Transaction: 0
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 4
- Subs: 0
- grid.Load: 0
- Transaction.Call (suplemento XML): 0

## Arvore completa

```text
WebPanel:HSelAlunoHistorico [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
└── WebPanel:HAlunoExtra [calls_webpanel_inferred|xml]
    ├── Procedure:PAlteraAlunoCPF [calls_procedure|index]
    │   ├── Procedure:PAtualizaPessoaAluno [calls_procedure|index]
    │   │   └── Procedure:PGravaAdmLog [calls_procedure|index]
    │   └── Procedure:PRemoveCaracterEspecial [calls_procedure|index]
    ├── Procedure:PCalculaDigitoMatricula [calls_procedure|index]
    ├── Procedure:PGravaAdmLog [calls_procedure|index]
    ├── Procedure:PIncluiAlunoCPF [calls_procedure|index]
    │   ├── Procedure:PAtualizaPessoaAluno [calls_procedure|index]
    │   │   └── Procedure:PGravaAdmLog [calls_procedure|index]
    │   └── Procedure:PRemoveCaracterEspecial [calls_procedure|index]
    ├── Procedure:PPesCPFAluno [calls_procedure|index]
    └── Procedure:PRemoveCaracterEspecial [calls_procedure|index]
```
