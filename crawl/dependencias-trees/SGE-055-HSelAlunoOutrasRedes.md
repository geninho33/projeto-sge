# SGE-055 - Estudantes de Outras Redes

- Prioridade: P2
- Modulo: Secretaria Educação
- Menu: Trabalhar com Estudantes > De Outras Redes
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelAlunoOutrasRedes.aspx
- WebPanel KB: `HSelAlunoOutrasRedes`
- Tier conversao: **M**
- Estimativa API: 6-10 dias
- Estimativa Frontend: 8-12 dias
- Risco: medio

## Metricas tecnicas

- Dependencias Procedure: 9
- Dependencias WebPanel: 4
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 16
- Subs: 1
- grid.Load: 1
- Transaction.Call (suplemento XML): 3

## Arvore completa

```text
WebPanel:HSelAlunoOutrasRedes [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Transaction:TAlunoOutrasRedes [calls_transaction_inferred|xml]
├── WebPanel:HIncluiAlunoOutrasRedes [calls_webpanel_inferred|xml]
│   ├── Procedure:PExcluirFotoAluno [calls_procedure|index]
│   ├── Procedure:PGravaAdmLog [calls_procedure|index]
│   ├── Procedure:PIncluiAluno [calls_procedure|index]
│   │   └── Procedure:PIncluiAlunoLog [calls_procedure|index]
│   │       └── Procedure:PGravaAdmLog [calls_procedure|index]
│   ├── Procedure:PIncluiAlunoFoto [calls_procedure|index]
│   ├── Procedure:PIncluiAlunoOutrasRedes [calls_procedure|index]
│   └── Procedure:PPesCPFAluno [calls_procedure|index]
├── WebPanel:HMostraLogs [calls_webpanel_inferred|xml]
├── WebPanel:HParametrosOutrasRedes [calls_webpanel_inferred|xml]
│   └── Procedure:PParametrosOutrasRedes [calls_procedure|index]
└── WebPanel:HSelAlunoDadosLE [calls_webpanel_inferred|xml]
```
