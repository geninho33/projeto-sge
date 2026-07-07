# SGE-083 - Estudantes Transportados

- Prioridade: P2
- Modulo: Transporte Escolar
- Menu: Entradas e saidas de produtos > Alunos
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hselalunostrans.aspx
- WebPanel KB: `HSelAlunosTrans`
- Tier conversao: **XS**
- Estimativa API: 1-2 dias
- Estimativa Frontend: 2-3 dias
- Risco: alto

## Metricas tecnicas

- Dependencias Procedure: 2
- Dependencias WebPanel: 0
- Dependencias Transaction: 0
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 11
- Subs: 0
- grid.Load: 0
- Transaction.Call (suplemento XML): 0

## Arvore completa

```text
WebPanel:HSelAlunosTrans [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:RTransCarteiraUsuario [calls_procedure|index]
└── Procedure:RTransCarteiraUsuario [calls_procedure_inferred|xml]
```
