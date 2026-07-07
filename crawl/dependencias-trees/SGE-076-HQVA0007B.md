# SGE-076 - Estudantes da Matrícula On-Line

- Prioridade: P2
- Modulo: Matrícula On-Line
- Menu: Trabalhar com Matrículas > Relatórios > QVA0007 - Matriculados e na Lista de Intenção
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HQVA0007B.aspx
- WebPanel KB: `HQVA0007B`
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
- Subs: 0
- grid.Load: 0
- Transaction.Call (suplemento XML): 0

## Arvore completa

```text
WebPanel:HQVA0007B [raiz]
└── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
```
