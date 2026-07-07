# SGE-080 - Consulta Unidades com Vagas

- Prioridade: P2
- Modulo: Secretaria Educação
- Menu: Trabalhar com Turmas > Vagas
- URL: https://www.sgebr.com.br/sge8105/sgeteste/HSelHistoricoVagas.aspx
- WebPanel KB: `HSelHistoricoVagas`
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
- Events: 7
- Subs: 2
- grid.Load: 0
- Transaction.Call (suplemento XML): 0

## Arvore completa

```text
WebPanel:HSelHistoricoVagas [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── Procedure:PHistoricoVagasMesSdt [calls_procedure|index]
│   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   └── SDT:Std_HVag [uses_resolved_custom_type|index]
├── Procedure:PHistoricoVagasMesSdt [calls_procedure_inferred|xml]
│   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   └── SDT:Std_HVag [uses_resolved_custom_type|index]
├── Procedure:PHistoricoVagasSdt [calls_procedure|index]
│   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   └── SDT:Std_HVag [uses_resolved_custom_type|index]
├── Procedure:PHistoricoVagasSdt [calls_procedure_inferred|xml]
│   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   └── SDT:Std_HVag [uses_resolved_custom_type|index]
├── Procedure:PQuadroVagas_Excel [calls_procedure|index]
│   ├── Procedure:PHistoricoVagasSdt [calls_procedure|index]
│   │   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   │   └── SDT:Std_HVag [uses_resolved_custom_type|index]
│   └── SDT:Std_HVag [uses_resolved_custom_type|index]
├── Procedure:PQuadroVagas_Excel [calls_procedure_inferred|xml]
│   ├── Procedure:PHistoricoVagasSdt [calls_procedure|index]
│   │   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
│   │   └── SDT:Std_HVag [uses_resolved_custom_type|index]
│   └── SDT:Std_HVag [uses_resolved_custom_type|index]
├── SDT:Std_HVag [uses_resolved_custom_type|index]
├── WebPanel:HSelHistoricoVagas [calls_webpanel_inferred|xml] (ciclo)
└── WebPanel:HSelHistoricoVagas_SemBairro [calls_webpanel_inferred|xml]
    ├── Procedure:PHistoricoVagasMesSdt [calls_procedure|index]
    │   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
    │   └── SDT:Std_HVag [uses_resolved_custom_type|index]
    ├── Procedure:PHistoricoVagasSdt [calls_procedure|index]
    │   ├── Procedure:PDescricaoEtapaNova [calls_procedure|index]
    │   └── SDT:Std_HVag [uses_resolved_custom_type|index]
    └── SDT:Std_HVag [uses_resolved_custom_type|index]
```
