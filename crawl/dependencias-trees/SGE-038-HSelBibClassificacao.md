# SGE-038 - IntelliBR Sistema de Gestão Escolar - Usuário: IntelliBR Sistemas Ano: 2026 UE: 8105 - FLORIANOPOLIS

- Prioridade: P2
- Modulo: Acervo Bibliotecário
- Menu: Catalogação de Acervo > Classificação(CDD)
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelBibClassificacao.aspx
- WebPanel KB: `HSelBibClassificacao`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 4
- Dependencias WebPanel: 1
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 13
- Subs: 1
- grid.Load: 1
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelBibClassificacao [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Transaction:TBib_Classificacao [calls_transaction_inferred|xml]
└── WebPanel:HBibCadAcervo [calls_webpanel_inferred|xml]
    ├── Procedure:PBibAcervoInclui [calls_procedure|index]
    ├── Procedure:PExcluirCapaLivro [calls_procedure|index]
    └── Procedure:PIncluiCapaLivro [calls_procedure|index]
```
