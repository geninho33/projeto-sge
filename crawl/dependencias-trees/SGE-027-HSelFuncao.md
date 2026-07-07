# SGE-027 - Tabela de Funções

- Prioridade: P2
- Modulo: Parametrização
- Menu: Tabelas do Sistema > Função
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HSelFuncao.aspx
- WebPanel KB: `HSelFuncao`
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
- Events: 11
- Subs: 0
- grid.Load: 0
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelFuncao [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
└── Transaction:TFuncao [calls_transaction_inferred|xml]
```
