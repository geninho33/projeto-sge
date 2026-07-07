# SGE-009 - Matrizes Curriculares - Cadastro

- Prioridade: P1
- Modulo: Parametrização
- Menu: Matrizes > Cadastro
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HSelCMatriz.aspx
- WebPanel KB: `HSelCMatriz`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 2
- Dependencias WebPanel: 2
- Dependencias Transaction: 0
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 15
- Subs: 1
- grid.Load: 1
- Transaction.Call (suplemento XML): 0

## Arvore completa

```text
WebPanel:HSelCMatriz [raiz]
├── Procedure:PAtualizaMatrizUE [calls_procedure|index]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── WebPanel:HSelCMatrizEtapa [calls_webpanel_inferred|xml]
└── WebPanel:HSelCMatrizUe [calls_webpanel_inferred|xml]
```
