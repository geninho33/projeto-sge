# SGE-098 - Consulta Estudante

- Prioridade: P2
- Modulo: Secretaria Educação
- Menu: Trabalhar com Estudantes > Consultar
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelAlunoDados.aspx
- WebPanel KB: `HSelAlunoDados`
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
- Events: 1
- Subs: 1
- grid.Load: 0
- Transaction.Call (suplemento XML): 0

## Arvore completa

```text
WebPanel:HSelAlunoDados [raiz]
└── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
```
