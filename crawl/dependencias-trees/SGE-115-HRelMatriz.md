# SGE-115 - Emissão de Relatórios de Matriz Curricular

- Prioridade: P3
- Modulo: Parametrização
- Menu: Matrizes > Relatórios
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HRelMatriz.aspx
- WebPanel KB: `HRelMatriz`
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
- Events: 2
- Subs: 1
- grid.Load: 0
- Transaction.Call (suplemento XML): 0

## Arvore completa

```text
WebPanel:HRelMatriz [raiz]
└── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
```
