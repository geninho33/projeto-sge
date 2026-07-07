# SGE-072 - Material Escolar

- Prioridade: P2
- Modulo: Secretaria Educação
- Menu: Cadastros > Material Escolar
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelMaterialEscolar.aspx
- WebPanel KB: `HSelMaterialEscolar`
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
- Events: 13
- Subs: 0
- grid.Load: 0
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelMaterialEscolar [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PMAE001_Excel [calls_procedure|index]
├── Procedure:PMAE001_Excel [calls_procedure_inferred|xml]
└── Transaction:TMaterialEscolar [calls_transaction_inferred|xml]
```
