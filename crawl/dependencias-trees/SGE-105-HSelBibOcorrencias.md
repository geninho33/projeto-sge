# SGE-105 - IntelliBR Sistema de Gestão Escolar - Usuário: IntelliBR Sistemas Ano: 2026 UE: 8105 - FLORIANOPOLIS

- Prioridade: P3
- Modulo: Acervo Bibliotecário
- Menu: Trabalhar com Unidades Escolares > Ocorrência
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelBibOcorrencias.aspx
- WebPanel KB: `HSelBibOcorrencias`
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
- Events: 14
- Subs: 1
- grid.Load: 1
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelBibOcorrencias [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
└── Transaction:TBbOcb [calls_transaction_inferred|xml]
```
