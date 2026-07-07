# SGE-060 - Grupo/Turma da Unidade Escolar

- Prioridade: P2
- Modulo: Lista Espera Infantil
- Menu: Tabelas do Sistema > Grupos por Escola
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelGrupoTurmaUe_LE.aspx
- WebPanel KB: `HSelGrupoTurmaUe_LE`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 4
- Dependencias WebPanel: 3
- Dependencias Transaction: 0
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 7
- Subs: 1
- grid.Load: 0
- Transaction.Call (suplemento XML): 0

## Arvore completa

```text
WebPanel:HSelGrupoTurmaUe_LE [raiz]
├── Procedure:PAtualizaUeGrupoTurma_LE [calls_procedure|index]
├── Procedure:PAtualizaUeGrupoTurma_LE [calls_procedure_inferred|xml]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PGravaAdmLog [calls_procedure|index]
├── Procedure:PGravaAdmLog [calls_procedure_inferred|xml]
├── WebPanel:HMostraLogs [calls_webpanel_inferred|xml]
├── WebPanel:HSelGrupoTurmaUe_LE_8259 [calls_webpanel_inferred|xml]
│   ├── Procedure:PAtualizaUeGrupoTurma_LE [calls_procedure|index]
│   └── Procedure:PGravaAdmLog [calls_procedure|index]
└── WebPanel:HSelGrupoTurma_LE [calls_webpanel_inferred|xml]
    ├── Procedure:PAtualizaUeGrupoTurma_LE [calls_procedure|index]
    └── Procedure:PReplicaGrupoTurma_LE [calls_procedure|index]
```
