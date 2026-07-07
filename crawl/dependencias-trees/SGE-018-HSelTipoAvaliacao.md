# SGE-018 - Cadastro de Tipos de Avaliação

- Prioridade: P1
- Modulo: Parametrização
- Menu: Parâmetros do Diário Eletrônico > Tipos de Avaliação
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HSelTipoAvaliacao.aspx
- WebPanel KB: `HSelTipoAvaliacao`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 2
- Dependencias WebPanel: 0
- Dependencias Transaction: 1
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 12
- Subs: 0
- grid.Load: 0
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelTipoAvaliacao [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PVerificaUsoTipoAvaliacaoProfessor [calls_procedure|index]
├── Procedure:PVerificaUsoTipoAvaliacaoProfessor [calls_procedure_inferred|xml]
└── Transaction:TTipoAvaliacaoProfessor_w [calls_transaction_inferred|xml]
```
