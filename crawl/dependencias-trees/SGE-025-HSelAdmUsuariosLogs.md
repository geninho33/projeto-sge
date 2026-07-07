# SGE-025 - Rastreabilidade de Usuários

- Prioridade: P2
- Modulo: Secretaria Educação
- Menu: Cadastros > Rastreabilidade
- URL: https://www.sgebr.com.br/sge8105/sgeteste/hSelAdmUsuariosLogs.aspx
- WebPanel KB: `HSelAdmUsuariosLogs`
- Tier conversao: **S**
- Estimativa API: 3-5 dias
- Estimativa Frontend: 4-6 dias
- Risco: baixo

## Metricas tecnicas

- Dependencias Procedure: 1
- Dependencias WebPanel: 2
- Dependencias Transaction: 0
- Dependencias DataProvider: 0
- Dependencias Table: 0
- Events: 11
- Subs: 0
- grid.Load: 0
- Transaction.Call (suplemento XML): 0

## Arvore completa

```text
WebPanel:HSelAdmUsuariosLogs [raiz]
├── Procedure:PConsultaPermissao [calls_procedure_udp_inferred|xml]
├── WebPanel:HMostraAdmLogUsuario [calls_webpanel_inferred|xml]
└── WebPanel:HSelUsuarioPerfilEntidadeLogs [calls_webpanel_inferred|xml]
```
