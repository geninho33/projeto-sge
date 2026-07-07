# SGE-046 - Tabela de Localização

- Prioridade: P2
- Modulo: Parametrização
- Menu: Tabelas do Sistema > Localizações
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelLocalizacao.aspx
- WebPanel KB: `HSelLocalizacao`
- Tier conversao: **XS**
- Estimativa API: 1-2 dias
- Estimativa Frontend: 2-3 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 1
- Dependencias WebPanel: 0
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 9
- Subs: 0
- grid.Load: 0
- Transaction.Call (suplemento XML): 3

## Arvore completa

```text
WebPanel:HSelLocalizacao [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
└── Transaction:TLocalizacao [calls_transaction_inferred|xml]
```
