# SGE-053 - IntelliBR Sistema de Gestão Escolar - Usuário: IntelliBR Sistemas Ano: 2026 UE: 8105 - FLORIANOPOLIS

- Prioridade: P2
- Modulo: Acervo Bibliotecário
- Menu: Catalogação de Acervo > Coleção e Série
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelBibColecaoSerie.aspx
- WebPanel KB: `HSelBibColecaoSerie`
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
WebPanel:HSelBibColecaoSerie [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Transaction:TBbCos [calls_transaction_inferred|xml]
└── WebPanel:HSelBibColecaoSerie [calls_webpanel_inferred|xml] (ciclo)
```
