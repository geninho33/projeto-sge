# SGE-064 - Níveis da Matriz Curricular

- Prioridade: P2
- Modulo: Parametrização
- Menu: Matrizes > Nível
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HSelMatrizNivel.aspx
- WebPanel KB: `HSelMatrizNivel`
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
- Events: 10
- Subs: 0
- grid.Load: 0
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelMatrizNivel [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
└── Transaction:TMatrizNivel [calls_transaction_inferred|xml]
```
