# SGE-107 - Ações de Busca Ativa

- Prioridade: P3
- Modulo: Parametrização
- Menu: Parâmetros do Diário Eletrônico > Ações de Busca Ativa
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HSelBuscaAtiva.aspx
- WebPanel KB: `HSelBuscaAtiva`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 2
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
WebPanel:HSelBuscaAtiva [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PVerificaUsoDiarioEletronicoMotivoFalta [calls_procedure_inferred|xml]
└── Transaction:TTabBuscaAtiva [calls_transaction_inferred|xml]
```
