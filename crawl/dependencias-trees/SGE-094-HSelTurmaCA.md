# SGE-094 - Criança Alfabetizada - Gerar Arquivos

- Prioridade: P2
- Modulo: Secretaria Educação
- Menu: Trabalhar com Turmas > Criança Alfabetizada
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelTurmaCA.aspx
- WebPanel KB: `HSelTurmaCA`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 5
- Dependencias WebPanel: 0
- Dependencias Transaction: 0
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 11
- Subs: 6
- grid.Load: 1
- Transaction.Call (suplemento XML): 0

## Arvore completa

```text
WebPanel:HSelTurmaCA [raiz]
├── Procedure:PBuscaProfessorRegente [calls_procedure|index]
├── Procedure:PBuscaProfessorRegente [calls_procedure_inferred|xml]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── Procedure:PDescricaoEtapaNova [calls_procedure_inferred|xml]
├── Procedure:PGeraArquivoCA [calls_procedure|index]
├── Procedure:PGeraArquivoCA [calls_procedure_inferred|xml]
├── Procedure:PObterURL [calls_procedure|index]
└── Procedure:PObterURL [calls_procedure_inferred|xml]
```
