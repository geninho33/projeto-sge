# SGE-101 - Emissão de Relatórios do Quadro de Vagas

- Prioridade: P2
- Modulo: Secretaria Educação
- Menu: Cadastros > Quadro de Vagas > Relatórios
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hRelQuadroVagas.aspx
- WebPanel KB: `HRelQuadroVagas`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 3
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
WebPanel:HRelQuadroVagas [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PParametros [calls_procedure|index]
├── Procedure:PParametros [calls_procedure_inferred|xml]
├── Procedure:PRelPopUp [calls_procedure|index]
└── Procedure:PRelPopUp [calls_procedure_inferred|xml]
```
