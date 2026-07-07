# SGE-109 - IntelliBR Sistema de Gestão Escolar - Usuário: IntelliBR Sistemas Ano: 2026 UE: 8105 - FLORIANOPOLIS

- Prioridade: P3
- Modulo: Acervo Bibliotecário
- Menu: Trabalhar com Unidades Escolares > Usuário
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelBibUsuario.aspx
- WebPanel KB: `HSelBibUsuario`
- Tier conversao: **M**
- Estimativa API: 6-10 dias
- Estimativa Frontend: 8-12 dias
- Risco: alto

## Metricas tecnicas

- Dependencias Procedure: 7
- Dependencias WebPanel: 2
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 11
- Subs: 1
- grid.Load: 1
- Transaction.Call (suplemento XML): 2

## Arvore completa

```text
WebPanel:HSelBibUsuario [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:RBibCarteiraUsuMod1 [calls_procedure|index]
├── Procedure:RBibCarteiraUsuMod1 [calls_procedure_inferred|xml]
├── Transaction:TBbCli [calls_transaction_inferred|xml]
├── WebPanel:HBibCliente [calls_webpanel_inferred|xml]
│   └── Procedure:PBibUsuarioInclui [calls_procedure|index]
│       └── Procedure:PIncluiAlunoLog [calls_procedure|index]
│           └── Procedure:PGravaAdmLog [calls_procedure|index]
└── WebPanel:HSelBibCadastroUsuario [calls_webpanel_inferred|xml]
    ├── Procedure:PGeraMatriculaAluno [calls_procedure|index]
    ├── Procedure:PGravaAdmLog [calls_procedure|index]
    └── Procedure:PIncluiAluno [calls_procedure|index]
        └── Procedure:PIncluiAlunoLog [calls_procedure|index]
            └── Procedure:PGravaAdmLog [calls_procedure|index]
```
