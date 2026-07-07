# SGE-007 - IntelliBR Sistema de Gestão Escolar - Usuário: IntelliBR Sistemas - Versão 6.0.0 de 02/01/2026 - 8105

- Prioridade: P1
- Modulo: Secretaria Educação
- Menu: Cadastros > Mudar Ano/UE
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hselanoue_desenv.aspx
- WebPanel KB: `HSelAnoUE_Desenv`
- Tier conversao: **M**
- Estimativa API: 6-10 dias
- Estimativa Frontend: 8-12 dias
- Risco: medio

## Metricas tecnicas

- Dependencias Procedure: 10
- Dependencias WebPanel: 2
- Dependencias Transaction: 0
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 2
- Subs: 1
- grid.Load: 0
- Transaction.Call (suplemento XML): 0

## Arvore completa

```text
WebPanel:HSelAnoUE_Desenv [raiz]
├── Procedure:PParametros [calls_procedure|index]
├── Procedure:PParametros [calls_procedure_inferred|xml]
├── WebPanel:HLogin [calls_webpanel_inferred|xml]
│   ├── Procedure:PAtualizaTabelaDistrito [calls_procedure|index]
│   ├── Procedure:PAtualizaTabelaNac [calls_procedure|index]
│   ├── Procedure:PAtualizaTabelaPais [calls_procedure|index]
│   ├── Procedure:PDecrypt64SenhaUsuario [calls_procedure|index]
│   ├── Procedure:PGeraNovaSenha [calls_procedure|index]
│   ├── Procedure:PGeraSenhaMaster [calls_procedure|index]
│   │   └── Procedure:PEncrypt64SenhaUsuario [calls_procedure|index]
│   ├── Procedure:PIncluiAcesso [calls_procedure|index]
│   ├── Procedure:PIncluiAcessoUsuario [calls_procedure|index]
│   └── Procedure:PParametros [calls_procedure|index]
└── WebPanel:HPrincipal [calls_webpanel_inferred|xml]
```
