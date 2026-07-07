# SGE-077 - Quadro de Vagas

- Prioridade: P2
- Modulo: Secretaria Educação
- Menu: Cadastros > Quadro de Vagas > Turmas
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelQuadroVagas.aspx
- WebPanel KB: `HSelQuadroVagas`
- Tier conversao: **M**
- Estimativa API: 6-10 dias
- Estimativa Frontend: 8-12 dias
- Risco: medio

## Metricas tecnicas

- Dependencias Procedure: 9
- Dependencias WebPanel: 2
- Dependencias Transaction: 2
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 19
- Subs: 6
- grid.Load: 1
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelQuadroVagas [raiz]
├── Procedure:PAtualizaQuadroMatricula [calls_procedure|index]
├── Procedure:PAtualizaQuadroMatricula [calls_procedure_inferred|xml]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PConsultaVagasOcupadasQV [calls_procedure|index]
├── Procedure:PConsultaVagasOcupadasQV [calls_procedure_inferred|xml]
├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
├── Procedure:PDescricaoEtapaNova [calls_procedure_inferred|xml]
├── Procedure:PGeraQuadroFundamental [calls_procedure|index]
│   └── Procedure:PGravaAdmLog [calls_procedure|index]
├── Procedure:PGeraQuadroFundamental [calls_procedure_inferred|xml]
│   └── Procedure:PGravaAdmLog [calls_procedure|index]
├── Procedure:PGeraQuadroFundamentalReal [calls_procedure|index]
│   └── Procedure:PGravaAdmLog [calls_procedure|index]
├── Procedure:PGeraQuadroFundamentalReal [calls_procedure_inferred|xml]
│   └── Procedure:PGravaAdmLog [calls_procedure|index]
├── Procedure:PGeraQuadroInfantilReal [calls_procedure|index]
│   └── Procedure:PGravaAdmLog [calls_procedure|index]
├── Procedure:PGeraQuadroInfantilReal [calls_procedure_inferred|xml]
│   └── Procedure:PGravaAdmLog [calls_procedure|index]
├── Transaction:TParametrosUE_ConfiguraIntegral [calls_transaction_inferred|xml]
├── Transaction:TQuadroVagas [calls_transaction_inferred|xml]
├── WebPanel:HMostraLogs [calls_webpanel_inferred|xml]
└── WebPanel:HQuadroVagas [calls_webpanel_inferred|xml]
    ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
    └── Procedure:PIncluiQuadroVagas [calls_procedure|index]
        ├── Procedure:PAtualizaQuadroMatricula [calls_procedure|index]
        └── Procedure:PGravaAdmLog [calls_procedure|index]
```
