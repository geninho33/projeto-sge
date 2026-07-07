# SGE-034 - IntelliBR Sistema de Gestão Escolar - Usuário: IntelliBR Sistemas Ano: 2026 UE: 8105 - FLORIANOPOLIS

- Prioridade: P2
- Modulo: Acervo Bibliotecário
- Menu: Catalogação de Acervo > Assunto-Vocabulário
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelBibVocaBasiContro.aspx
- WebPanel KB: `HSelBibVocaBasiContro`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 1
- Dependencias WebPanel: 0
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 13
- Subs: 1
- grid.Load: 1
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelBibVocaBasiContro [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
└── Transaction:TBvVbc [calls_transaction_inferred|xml]
```
