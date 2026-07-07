# SGE-071 - Tabela de Linhas de Ônibus

- Prioridade: P2
- Modulo: Parametrização
- Menu: Tabelas do Sistema > Linha Ônibus
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hseltablinhaonibuscomrota.aspx
- WebPanel KB: `HSelTabLinhaOnibusComRota`
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
- Events: 10
- Subs: 1
- grid.Load: 0
- Transaction.Call (suplemento XML): 3

## Arvore completa

```text
WebPanel:HSelTabLinhaOnibusComRota [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Transaction:TTabLinhaOnibusComRota [calls_transaction_inferred|xml]
└── WebPanel:HSelTabLinhaOunibusUe [calls_webpanel_inferred|xml]
    └── Procedure:PAtualizaLinhaOnibusUe [calls_procedure|index]
```
