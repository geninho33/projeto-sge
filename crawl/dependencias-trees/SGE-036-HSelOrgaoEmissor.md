# SGE-036 - Seleção de Órgão Emissor

- Prioridade: P2
- Modulo: Parametrização
- Menu: Tabelas do Sistema > Órgão Emissor Docto
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HSelOrgaoEmissor.aspx
- WebPanel KB: `HSelOrgaoEmissor`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 1
- Dependencias WebPanel: 0
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 10
- Subs: 0
- grid.Load: 0
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelOrgaoEmissor [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
└── Transaction:TOrgaoEmissor [calls_transaction_inferred|xml]
```
