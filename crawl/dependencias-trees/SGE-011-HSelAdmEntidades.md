# SGE-011 - Cadastro de Entidades

- Prioridade: P1
- Modulo: Secretaria Educação
- Menu: Cadastros > Entidades
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelAdmEntidades.aspx
- WebPanel KB: `HSelAdmEntidades`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 2
- Dependencias WebPanel: 1
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 17
- Subs: 1
- grid.Load: 1
- Transaction.Call (suplemento XML): 3

## Arvore completa

```text
WebPanel:HSelAdmEntidades [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PImportaCadastroEscolas [calls_procedure|index]
├── Procedure:PImportaCadastroEscolas [calls_procedure_inferred|xml]
├── Transaction:TAdmENTIDADE [calls_transaction_inferred|xml]
└── WebPanel:HUsuariosEntidade [calls_webpanel_inferred|xml]
```
