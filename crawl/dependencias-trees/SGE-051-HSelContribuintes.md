# SGE-051 - Tabela de Contribuintes/Empresas

- Prioridade: P2
- Modulo: Parametrização
- Menu: Tabelas do Sistema > Empresas
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HSelContribuintes.aspx
- WebPanel KB: `HSelContribuintes`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: alto

## Metricas tecnicas

- Dependencias Procedure: 2
- Dependencias WebPanel: 1
- Dependencias Transaction: 3
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 15
- Subs: 1
- grid.Load: 1
- Transaction.Call (suplemento XML): 6

## Arvore completa

```text
WebPanel:HSelContribuintes [raiz]
├── Procedure:PCPF_CNPJ [calls_procedure_inferred|xml]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Transaction:TContribuintes [calls_transaction_inferred|xml]
├── Transaction:TContribuintesEscolaConvenio [calls_transaction_inferred|xml]
├── Transaction:TContribuintesGrupoMun [calls_transaction_inferred|xml]
└── WebPanel:HVisualizaRelatorio_LE [calls_webpanel_inferred|xml]
```
