-- Schema do sistema de gestão do projeto de migração SGE
-- Prefixo: sge_pm_

CREATE TABLE IF NOT EXISTS sge_pm_schema_migrations (
  name VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sge_pm_projeto (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  descricao TEXT,
  data_inicio DATE,
  data_fim_prevista DATE,
  status ENUM('planejamento','ativo','pausado','concluido') DEFAULT 'planejamento',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sge_pm_usuario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(80) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  perfil ENUM('gestor','tech_lead','dev_front','dev_back','qa') NOT NULL,
  ativo TINYINT(1) DEFAULT 1
);

CREATE TABLE IF NOT EXISTS sge_pm_skill (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nome VARCHAR(80) NOT NULL,
  lado ENUM('backend','frontend','pm','qa') NOT NULL,
  nivel_minimo ENUM('junior','pleno','senior') NOT NULL
);

CREATE TABLE IF NOT EXISTS sge_pm_usuario_skill (
  usuario_id INT NOT NULL,
  skill_id INT NOT NULL,
  nivel ENUM('junior','pleno','senior') NOT NULL,
  PRIMARY KEY (usuario_id, skill_id),
  FOREIGN KEY (usuario_id) REFERENCES sge_pm_usuario(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES sge_pm_skill(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sge_pm_backlog_item (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  modulo VARCHAR(200),
  aspx_origem VARCHAR(120),
  url_origem VARCHAR(500),
  prioridade ENUM('P1','P2','P3') NOT NULL,
  tipo_tela ENUM('grid_form','grid_intensivo','navegacao_densa') NOT NULL,
  score INT NOT NULL DEFAULT 0,
  controles INT NOT NULL DEFAULT 0,
  story_points INT NOT NULL DEFAULT 1,
  screenshot_path VARCHAR(300),
  justificativa TEXT,
  status_geral ENUM('backlog','em_andamento','bloqueado','concluido') DEFAULT 'backlog'
);

CREATE TABLE IF NOT EXISTS sge_pm_backlog_item_skill (
  backlog_item_id INT NOT NULL,
  skill_id INT NOT NULL,
  obrigatoria TINYINT(1) DEFAULT 1,
  PRIMARY KEY (backlog_item_id, skill_id),
  FOREIGN KEY (backlog_item_id) REFERENCES sge_pm_backlog_item(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES sge_pm_skill(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sge_pm_mapeamento_mudanca (
  id INT AUTO_INCREMENT PRIMARY KEY,
  backlog_item_id INT UNIQUE NOT NULL,
  id_user_front INT,
  id_user_back INT,
  branch_front VARCHAR(120),
  branch_back VARCHAR(120),
  status_front ENUM('nao_iniciado','em_dev','em_review','pronto','merged') DEFAULT 'nao_iniciado',
  status_back ENUM('nao_iniciado','em_dev','em_review','pronto','merged') DEFAULT 'nao_iniciado',
  api_contract_path VARCHAR(300),
  pr_front_url VARCHAR(300),
  pr_back_url VARCHAR(300),
  merged_at DATETIME NULL,
  FOREIGN KEY (backlog_item_id) REFERENCES sge_pm_backlog_item(id) ON DELETE CASCADE,
  FOREIGN KEY (id_user_front) REFERENCES sge_pm_usuario(id) ON DELETE SET NULL,
  FOREIGN KEY (id_user_back) REFERENCES sge_pm_usuario(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sge_pm_sprint (
  id INT AUTO_INCREMENT PRIMARY KEY,
  projeto_id INT NOT NULL,
  numero INT NOT NULL,
  nome VARCHAR(80) NOT NULL,
  data_inicio DATE,
  data_fim DATE,
  capacity_points INT DEFAULT 40,
  status ENUM('planejada','ativa','encerrada') DEFAULT 'planejada',
  UNIQUE (projeto_id, numero),
  FOREIGN KEY (projeto_id) REFERENCES sge_pm_projeto(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sge_pm_sprint_backlog_item (
  sprint_id INT NOT NULL,
  backlog_item_id INT NOT NULL,
  story_points INT NOT NULL,
  PRIMARY KEY (sprint_id, backlog_item_id),
  FOREIGN KEY (sprint_id) REFERENCES sge_pm_sprint(id) ON DELETE CASCADE,
  FOREIGN KEY (backlog_item_id) REFERENCES sge_pm_backlog_item(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sge_pm_usuario_projeto (
  projeto_id INT NOT NULL,
  usuario_id INT NOT NULL,
  papel VARCHAR(40) NOT NULL DEFAULT 'membro',
  PRIMARY KEY (projeto_id, usuario_id),
  FOREIGN KEY (projeto_id) REFERENCES sge_pm_projeto(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES sge_pm_usuario(id) ON DELETE CASCADE
);
