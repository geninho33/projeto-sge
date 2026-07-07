# SGE-110 - Tabela de Ruas

- Prioridade: P3
- Modulo: Parametrização
- Menu: Tabelas do Sistema > Ruas
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HSelRuas.aspx
- WebPanel KB: `HSelRuas`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 1
- Dependencias WebPanel: 1
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 12
- Subs: 1
- grid.Load: 0
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelRuas [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Transaction:TRuas [calls_transaction_inferred|xml]
└── WebPanel:HVisualizaRelatorio_LE [calls_webpanel_inferred|xml]
```
