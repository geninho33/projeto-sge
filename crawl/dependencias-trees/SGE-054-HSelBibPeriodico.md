# SGE-054 - IntelliBR Sistema de Gestão Escolar - Usuário: IntelliBR Sistemas Ano: 2026 UE: 8105 - FLORIANOPOLIS

- Prioridade: P2
- Modulo: Acervo Bibliotecário
- Menu: Catalogação de Acervo > Periódico
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelBibPeriodico.aspx
- WebPanel KB: `HSelBibPeriodico`
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
WebPanel:HSelBibPeriodico [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Transaction:TBbPdc [calls_transaction_inferred|xml]
└── WebPanel:HSelBibPeriodico [calls_webpanel_inferred|xml] (ciclo)
```
