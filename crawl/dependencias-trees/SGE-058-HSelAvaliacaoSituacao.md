# SGE-058 - Cadastro de Situações de Tipos de Avaliação

- Prioridade: P2
- Modulo: Parametrização
- Menu: Parâmetros do Diário Eletrônico > Situações de Avaliações
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HSelAvaliacaoSituacao.aspx
- WebPanel KB: `HSelAvaliacaoSituacao`
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
- Events: 6
- Subs: 0
- grid.Load: 0
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelAvaliacaoSituacao [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PVerificaUsoAvaliacaoSituacao [calls_procedure|index]
├── Procedure:PVerificaUsoAvaliacaoSituacao [calls_procedure_inferred|xml]
└── Transaction:TTipoAvaliacaoSituacao_w [calls_transaction_inferred|xml]
```
