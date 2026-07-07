# SGE-043 - Parâmetro para Programar Execução de Rotinas

- Prioridade: P2
- Modulo: Secretaria Educação
- Menu: Cadastros > Programar Rotinas
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelParametroProcessamentos.aspx
- WebPanel KB: `HSelParametroProcessamentos`
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
- Events: 13
- Subs: 1
- grid.Load: 0
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelParametroProcessamentos [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
└── Transaction:TParametroProcessamentos [calls_transaction_inferred|xml]
```
