# SGE-100 - Sel Veiculos

- Prioridade: P2
- Modulo: Transporte Escolar
- Menu: Entradas e saidas de produtos > Veiculos
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hselveiculos.aspx
- WebPanel KB: `HSelVeiculos`
- Tier conversao: **XS**
- Estimativa API: 1-2 dias
- Estimativa Frontend: 2-3 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 1
- Dependencias WebPanel: 0
- Dependencias Transaction: 0
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 8
- Subs: 0
- grid.Load: 0
- Transaction.Call (suplemento XML): 0

## Arvore completa

```text
WebPanel:HSelVeiculos [raiz]
└── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
```
