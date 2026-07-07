# SGE-042 - Configurar Servidor de Email

- Prioridade: P2
- Modulo: Parametrização
- Menu: Tabelas do Sistema > Servidor de Email
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HConfiguraServidorEmail.aspx
- WebPanel KB: `HConfiguraServidorEmail`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 4
- Dependencias WebPanel: 0
- Dependencias Transaction: 0
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 5
- Subs: 0
- grid.Load: 0
- Transaction.Call (suplemento XML): 0

## Arvore completa

```text
WebPanel:HConfiguraServidorEmail [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PEnviarEmail [calls_procedure|index]
├── Procedure:PEnviarEmail [calls_procedure_inferred|xml]
├── Procedure:PEnviarEmailWS [calls_procedure|index]
├── Procedure:PEnviarEmailWS [calls_procedure_inferred|xml]
├── Procedure:PParametrosEmailServidor [calls_procedure|index]
└── Procedure:PParametrosEmailServidor [calls_procedure_inferred|xml]
```
