# SGE-028 - IntelliBR Sistema de Gestão Escolar - Usuário: IntelliBR Sistemas Ano: 2026 UE: 8105 - FLORIANOPOLIS

- Prioridade: P2
- Modulo: Acervo Bibliotecário
- Menu: Vocabulário > Consulta VCB
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelBibVCB.aspx
- WebPanel KB: `HSelBibVCB`
- Tier conversao: **M**
- Estimativa API: 6-10 dias
- Estimativa Frontend: 8-12 dias
- Risco: medio

## Metricas tecnicas

- Dependencias Procedure: 1
- Dependencias WebPanel: 1
- Dependencias Transaction: 0
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 47
- Subs: 5
- grid.Load: 0
- Transaction.Call (suplemento XML): 0

## Arvore completa

```text
WebPanel:HSelBibVCB [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
└── WebPanel:HPrincipal [calls_webpanel_inferred|xml]
```
