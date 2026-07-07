# SGE-006 - Cadastro de Notícias

- Prioridade: P1
- Modulo: Secretaria Educação
- Menu: Cadastros > Notícias
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelAdmNoticias.aspx
- WebPanel KB: `HSelAdmNoticias`
- Tier conversao: **M**
- Estimativa API: 6-10 dias
- Estimativa Frontend: 8-12 dias
- Risco: medio

## Metricas tecnicas

- Dependencias Procedure: 2
- Dependencias WebPanel: 2
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 12
- Subs: 0
- grid.Load: 0
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelAdmNoticias [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Transaction:TAdmNOTICIAS [calls_transaction_inferred|xml]
├── WebPanel:HSelAdmNoticiasAnexos [calls_webpanel_inferred|xml]
└── WebPanel:HSelNoticiasEntidades [calls_webpanel_inferred|xml]
    └── Procedure:PAtualizaNoticiasEntidades [calls_procedure|index]
```
