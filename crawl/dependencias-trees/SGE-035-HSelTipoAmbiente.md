# SGE-035 - Ambientes

- Prioridade: P2
- Modulo: Ambiente Escolar
- Menu: Ambientes da UE > Tipos
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HSelTipoAmbiente.aspx
- WebPanel KB: `HSelTipoAmbiente`
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
- Subs: 1
- grid.Load: 0
- Transaction.Call (suplemento XML): 5

## Arvore completa

```text
WebPanel:HSelTipoAmbiente [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
└── Transaction:TTabAmbiente [calls_transaction_inferred|xml]
```
