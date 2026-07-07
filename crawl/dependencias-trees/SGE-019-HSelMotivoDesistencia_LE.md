# SGE-019 - Motivos de Desistência da Lista de Espera

- Prioridade: P1
- Modulo: Lista Espera Infantil
- Menu: Tabelas do Sistema > Motivos Desistência
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelMotivoDesistencia_LE.aspx
- WebPanel KB: `HSelMotivoDesistencia_LE`
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
- Events: 11
- Subs: 1
- grid.Load: 0
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelMotivoDesistencia_LE [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
└── Transaction:TMotivoDesistencia_LE [calls_transaction_inferred|xml]
```
