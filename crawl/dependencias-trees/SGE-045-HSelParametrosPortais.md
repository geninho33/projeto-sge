# SGE-045 - Parâmetros Portais

- Prioridade: P2
- Modulo: Parametrização
- Menu: Parâmetros do Diário Eletrônico > Configuração Portais
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HSelParametrosPortais.aspx
- WebPanel KB: `HSelParametrosPortais`
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
- Events: 6
- Subs: 0
- grid.Load: 0
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelParametrosPortais [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
└── Transaction:TParametrosPortais [calls_transaction_inferred|xml]
```
