# SGE-062 - Vulnerabilidades da Lista de Espera

- Prioridade: P2
- Modulo: Lista Espera Infantil
- Menu: Tabelas do Sistema > Vulnerabilidade
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelVulnerabilidade_LE.aspx
- WebPanel KB: `HSelVulnerabilidade_LE`
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
- Events: 11
- Subs: 1
- grid.Load: 0
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelVulnerabilidade_LE [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
└── Transaction:TVulnerabilidade_LE [calls_transaction_inferred|xml]
```
