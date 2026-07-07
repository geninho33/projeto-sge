# SGE-022 - Grupo/Turma da Lista de Espera - Ano de 2026

- Prioridade: P1
- Modulo: Lista Espera Infantil
- Menu: Tabelas do Sistema > Grupo/Turma
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelGrupoTurma_LE.aspx
- WebPanel KB: `HSelGrupoTurma_LE`
- Tier conversao: **M**
- Estimativa API: 6-10 dias
- Estimativa Frontend: 8-12 dias
- Risco: medio

## Metricas tecnicas

- Dependencias Procedure: 4
- Dependencias WebPanel: 3
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 15
- Subs: 3
- grid.Load: 0
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelGrupoTurma_LE [raiz]
├── Procedure:PAtualizaUeGrupoTurma_LE [calls_procedure|index]
├── Procedure:PAtualizaUeGrupoTurma_LE [calls_procedure_inferred|xml]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PReplicaGrupoTurma_LE [calls_procedure|index]
├── Procedure:PReplicaGrupoTurma_LE [calls_procedure_inferred|xml]
├── Transaction:TGrupoTurma_LE [calls_transaction_inferred|xml]
├── WebPanel:HMostraLogs [calls_webpanel_inferred|xml]
├── WebPanel:HSelGrupoTurma_LE_8259 [calls_webpanel_inferred|xml]
│   ├── Procedure:PAtualizaUeGrupoTurma_LE [calls_procedure|index]
│   └── Procedure:PReplicaGrupoTurma_LE [calls_procedure|index]
└── WebPanel:HSelUeGrupoTurma_LE [calls_webpanel_inferred|xml]
    ├── Procedure:PAtualizaUeGrupoTurma_LE [calls_procedure|index]
    └── Procedure:PGravaAdmLog [calls_procedure|index]
```
