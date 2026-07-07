INSERT IGNORE INTO sge_pm_skill (codigo, nome, lado, nivel_minimo) VALUES
('SK-GX-01', 'GeneXus 18 — Transactions/BC', 'backend', 'pleno'),
('SK-GX-02', 'REST Services / OData exposure', 'backend', 'pleno'),
('SK-GX-03', 'Refatoração WebPanel → API pura', 'backend', 'senior'),
('SK-GX-04', 'Otimização SQL / Data Providers', 'backend', 'senior'),
('SK-GX-05', 'Segurança API (GAM OAuth2/JWT)', 'backend', 'senior'),
('SK-FE-01', 'React + componentização', 'frontend', 'pleno'),
('SK-FE-02', 'Grids complexas (virtualização)', 'frontend', 'senior'),
('SK-FE-03', 'State Management (Context/Redux)', 'frontend', 'pleno'),
('SK-FE-04', 'Axios + interceptors auth', 'frontend', 'pleno'),
('SK-FE-05', 'Formulários dinâmicos (schema-driven)', 'frontend', 'senior'),
('SK-PM-01', 'Gestão ágil / backlog', 'pm', 'pleno'),
('SK-QA-01', 'Testes E2E fluxos críticos', 'qa', 'pleno');

INSERT IGNORE INTO sge_pm_projeto (id, nome, descricao, data_inicio, status) VALUES
(1, 'Migração SGE Híbrida', 'Migração de 115 telas GeneXus Web Forms para React + GeneXus REST', CURDATE(), 'ativo');

INSERT IGNORE INTO sge_pm_usuario (id, nome, email, perfil) VALUES
(1, 'Gestor do Projeto', 'gestor@sge.local', 'gestor'),
(2, 'Tech Lead', 'techlead@sge.local', 'tech_lead'),
(3, 'Dev Frontend Sênior', 'devfront@sge.local', 'dev_front'),
(4, 'Dev Backend GeneXus', 'devback@sge.local', 'dev_back'),
(5, 'QA Pleno', 'qa@sge.local', 'qa');

INSERT IGNORE INTO sge_pm_usuario_projeto (projeto_id, usuario_id, papel) VALUES
(1, 1, 'gestor'), (1, 2, 'tech_lead'), (1, 3, 'dev_front'), (1, 4, 'dev_back'), (1, 5, 'qa');

INSERT IGNORE INTO sge_pm_sprint (projeto_id, numero, nome, data_inicio, data_fim, capacity_points, status) VALUES
(1, 0, 'Sprint 0 — Fundação PM', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 40, 'ativa'),
(1, 1, 'Sprint 1 — Onboarding P3', DATE_ADD(CURDATE(), INTERVAL 14 DAY), DATE_ADD(CURDATE(), INTERVAL 28 DAY), 40, 'planejada'),
(1, 2, 'Sprint 2 — Cadastros base', DATE_ADD(CURDATE(), INTERVAL 28 DAY), DATE_ADD(CURDATE(), INTERVAL 42 DAY), 40, 'planejada'),
(1, 3, 'Sprint 3 — Fluxos P1 menores', DATE_ADD(CURDATE(), INTERVAL 42 DAY), DATE_ADD(CURDATE(), INTERVAL 56 DAY), 40, 'planejada');
