# SGE-014 - Cadastro de Motivos de Ausência

- Prioridade: P1
- Modulo: Parametrização
- Menu: Parâmetros do Diário Eletrônico > Motivos de Ausência
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HSelMotivoFalta.aspx
- WebPanel KB: `HSelMotivoFalta`
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
- Events: 11
- Subs: 0
- grid.Load: 0
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelMotivoFalta [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PVerificaUsoDiarioEletronicoMotivoFalta [calls_procedure|index]
├── Procedure:PVerificaUsoDiarioEletronicoMotivoFalta [calls_procedure_inferred|xml]
└── Transaction:TDiarioEletronicoMotivoFalta [calls_transaction_inferred|xml]
```
