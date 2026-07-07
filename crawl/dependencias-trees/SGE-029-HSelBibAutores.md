# SGE-029 - IntelliBR Sistema de Gestão Escolar - Usuário: IntelliBR Sistemas Ano: 2026 UE: 8105 - FLORIANOPOLIS

- Prioridade: P2
- Modulo: Acervo Bibliotecário
- Menu: Catalogação de Acervo > Autor
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelBibAutores.aspx
- WebPanel KB: `HSelBibAutores`
- Tier conversao: **M**
- Estimativa API: 6-10 dias
- Estimativa Frontend: 8-12 dias
- Risco: medio

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
WebPanel:HSelBibAutores [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Transaction:TBbAut [calls_transaction_inferred|xml]
└── WebPanel:HBibCadAcervo [calls_webpanel_inferred|xml]
    ├── Procedure:PBibAcervoInclui [calls_procedure|index]
    ├── Procedure:PExcluirCapaLivro [calls_procedure|index]
    └── Procedure:PIncluiCapaLivro [calls_procedure|index]
```
