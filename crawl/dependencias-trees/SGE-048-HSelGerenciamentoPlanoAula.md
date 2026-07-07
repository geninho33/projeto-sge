# SGE-048 - Gerenciamento do Planejamento

- Prioridade: P2
- Modulo: Secretaria Educação
- Menu: Trabalhar com Turmas > Gerenciamento Planejamento
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelGerenciamentoPlanoAula.aspx
- WebPanel KB: `HSelGerenciamentoPlanoAula`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 5
- Dependencias WebPanel: 1
- Dependencias Transaction: 0
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 10
- Subs: 4
- grid.Load: 1
- Transaction.Call (suplemento XML): 0

## Arvore completa

```text
WebPanel:HSelGerenciamentoPlanoAula [raiz]
├── Procedure:PBuscaProfessorRegente [calls_procedure|index]
├── Procedure:PBuscaProfessorRegente [calls_procedure_inferred|xml]
├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── Procedure:PDescricaoEtapaNova [calls_procedure_inferred|xml]
├── Procedure:PObterURL [calls_procedure|index]
├── Procedure:PObterURL [calls_procedure_inferred|xml]
└── WebPanel:HPlanejamentoDisciplinasGer [calls_webpanel_inferred|xml]
    └── Procedure:PConsultaColecaoProfsCPFMat [calls_procedure|index]
        ├── Procedure:PGeraLog [calls_procedure|index]
        └── SDT:sdt_ConsultaDocente [uses_resolved_custom_type|index]
```
