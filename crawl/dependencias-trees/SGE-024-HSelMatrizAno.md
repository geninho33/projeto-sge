# SGE-024 - Matrizes Curriculares do Ano - Autorizadas

- Prioridade: P2
- Modulo: Parametrização
- Menu: Matrizes > Autorizadas
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HSelMatrizAno.aspx
- WebPanel KB: `HSelMatrizAno`
- Tier conversao: **L**
- Estimativa API: 11-18 dias
- Estimativa Frontend: 12-20 dias
- Risco: medio

## Metricas tecnicas

- Dependencias Procedure: 15
- Dependencias WebPanel: 2
- Dependencias Transaction: 0
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 16
- Subs: 1
- grid.Load: 1
- Transaction.Call (suplemento XML): 0

## Arvore completa

```text
WebPanel:HSelMatrizAno [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PMatrizErrada [calls_procedure_inferred|xml]
├── WebPanel:HMatrizFormulaAno [calls_webpanel_inferred|xml]
│   └── Procedure:PMatrizFormulaAno [calls_procedure|index]
└── WebPanel:HSelMatrizEtapaAno [calls_webpanel_inferred|xml]
    ├── Procedure:PAtCarMatriz [calls_procedure|index]
    ├── Procedure:PAtCargaHoraria [calls_procedure|index]
    │   └── Procedure:PCalFrequenciaAvaCon [calls_procedure|index]
    └── Procedure:PAtualizaNotaFalta [calls_procedure|index]
        ├── Procedure:PAplicaFormula [calls_procedure|index]
        │   ├── Procedure:PCalExp [calls_procedure|index]
        │   └── Procedure:PCalculaExameFinalProficiencia [calls_procedure|index]
        ├── Procedure:PAplicaFormulacRecDiarioElet [calls_procedure|index]
        │   ├── Procedure:PAplicaFormula [calls_procedure|index]
        │   │   ├── Procedure:PCalExp [calls_procedure|index]
        │   │   └── Procedure:PCalculaExameFinalProficiencia [calls_procedure|index]
        │   └── Procedure:PCalExp [calls_procedure|index]
        ├── Procedure:PCalFrequenciaAvaCon [calls_procedure|index]
        ├── Procedure:PCalFrequenciaAvaDes [calls_procedure|index]
        ├── Procedure:PCalFrequenciaAvaNum [calls_procedure|index]
        ├── Procedure:PGrSituacaoCursoAluno [calls_procedure|index]
        └── Procedure:PVerAvaliacaoNE [calls_procedure|index]
```
