# SGE-099 - Quadro de Vagas por Área de Ensino

- Prioridade: P2
- Modulo: Matrícula On-Line
- Menu: Trabalhar com Quadro de Vagas > Por Área Ensino
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelQuadroVagasArea.aspx
- WebPanel KB: `HSelQuadroVagasArea`
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
- Events: 13
- Subs: 1
- grid.Load: 0
- Transaction.Call (suplemento XML): 4

## Arvore completa

```text
WebPanel:HSelQuadroVagasArea [raiz]
├── Procedure:PConsultaMostra [calls_procedure_udp_inferred|xml]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
└── Transaction:TQuadroVagasArea [calls_transaction_inferred|xml]
```
