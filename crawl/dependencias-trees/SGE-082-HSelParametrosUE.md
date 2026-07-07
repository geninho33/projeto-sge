# SGE-082 - Parâmetros da Unidade Escolar

- Prioridade: P2
- Modulo: Secretaria Educação
- Menu: Cadastros > Diário Eletrônico e Boletins
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelParametrosUe.aspx
- WebPanel KB: `HSelParametrosUE`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 2
- Dependencias WebPanel: 0
- Dependencias Transaction: 3
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 9
- Subs: 0
- grid.Load: 0
- Transaction.Call (suplemento XML): 5

## Arvore completa

```text
WebPanel:HSelParametrosUE [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PIncluiParametroSGE [calls_procedure|index]
├── Procedure:PIncluiParametroSGE [calls_procedure_inferred|xml]
├── Transaction:TParametrosUE [calls_transaction_inferred|xml]
├── Transaction:TParametrosUE_PortalAluno [calls_transaction_inferred|xml]
└── Transaction:TParametrosUE_PortalProfessor [calls_transaction_inferred|xml]
```
