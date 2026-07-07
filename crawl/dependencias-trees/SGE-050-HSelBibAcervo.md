# SGE-050 - IntelliBR Sistema de Gestão Escolar - Usuário: IntelliBR Sistemas Ano: 2026 UE: 8105 - FLORIANOPOLIS

- Prioridade: P2
- Modulo: Acervo Bibliotecário
- Menu: Catalogação de Acervo > Acervo
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelBibAcervo.aspx
- WebPanel KB: `HSelBibAcervo`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 5
- Dependencias WebPanel: 2
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 7
- Subs: 1
- grid.Load: 1
- Transaction.Call (suplemento XML): 5

## Arvore completa

```text
WebPanel:HSelBibAcervo [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Transaction:TBbAce [calls_transaction_inferred|xml]
├── WebPanel:HBibCadAcervo [calls_webpanel_inferred|xml]
│   ├── Procedure:PBibAcervoInclui [calls_procedure|index]
│   ├── Procedure:PExcluirCapaLivro [calls_procedure|index]
│   └── Procedure:PIncluiCapaLivro [calls_procedure|index]
├── WebPanel:HSelBibAcervo [calls_webpanel_inferred|xml] (ciclo)
└── WebPanel:HSelBibAtuaInventario [calls_webpanel_inferred|xml]
    └── Procedure:PInventarioAtualiza [calls_procedure|index]
```
