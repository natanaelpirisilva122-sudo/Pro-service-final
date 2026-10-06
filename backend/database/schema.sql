-- =============================================================
-- PRO SERVICE - Banco de dados principal
-- Projeto Integrador - 6º período
-- MySQL 8+
-- =============================================================

CREATE DATABASE IF NOT EXISTS db_ProService
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE db_ProService;

CREATE TABLE IF NOT EXISTS usuarios (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL,
  telefone VARCHAR(20) NULL,
  senha_hash VARCHAR(255) NOT NULL,
  tipo ENUM('CLIENTE', 'PRESTADOR') NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uk_usuarios_email (email),
  KEY idx_usuarios_tipo_ativo (tipo, ativo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS perfis_prestadores (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id BIGINT UNSIGNED NOT NULL,
  descricao VARCHAR(1000) NULL,
  cidade VARCHAR(100) NULL,
  uf CHAR(2) NULL,
  preco_hora DECIMAL(10,2) NULL,
  anos_experiencia SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uk_perfil_usuario (usuario_id),
  KEY idx_perfis_localizacao (cidade, uf),
  KEY idx_perfis_preco (preco_hora),

  CONSTRAINT fk_perfil_usuario
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT ck_preco_hora
    CHECK (preco_hora IS NULL OR preco_hora >= 0),

  CONSTRAINT ck_anos_experiencia
    CHECK (anos_experiencia <= 80)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS habilidades (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uk_habilidade_nome_categoria (nome, categoria),
  KEY idx_habilidades_categoria (categoria)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS prestador_habilidades (
  perfil_prestador_id BIGINT UNSIGNED NOT NULL,
  habilidade_id BIGINT UNSIGNED NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (perfil_prestador_id, habilidade_id),
  KEY idx_ph_habilidade (habilidade_id),

  CONSTRAINT fk_ph_perfil
    FOREIGN KEY (perfil_prestador_id)
    REFERENCES perfis_prestadores(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_ph_habilidade
    FOREIGN KEY (habilidade_id)
    REFERENCES habilidades(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS servicos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cliente_id BIGINT UNSIGNED NOT NULL,
  prestador_id BIGINT UNSIGNED NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  descricao VARCHAR(2000) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  endereco VARCHAR(255) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  uf CHAR(2) NOT NULL,
  valor_combinado DECIMAL(10,2) NULL,
  status ENUM('PENDENTE', 'ACEITO', 'CONCLUIDO', 'CANCELADO')
    NOT NULL DEFAULT 'PENDENTE',
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_servicos_cliente (cliente_id, status),
  KEY idx_servicos_prestador (prestador_id, status),
  KEY idx_servicos_categoria_local (categoria, cidade, uf),
  KEY idx_servicos_criado_em (criado_em),

  CONSTRAINT fk_servico_cliente
    FOREIGN KEY (cliente_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_servico_prestador
    FOREIGN KEY (prestador_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,


  CONSTRAINT ck_valor_combinado
    CHECK (valor_combinado IS NULL OR valor_combinado >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS avaliacoes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  servico_id BIGINT UNSIGNED NOT NULL,
  cliente_id BIGINT UNSIGNED NOT NULL,
  nota TINYINT UNSIGNED NOT NULL,
  comentario VARCHAR(1000) NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uk_avaliacao_servico (servico_id),
  KEY idx_avaliacoes_cliente (cliente_id),
  KEY idx_avaliacoes_nota (nota),

  CONSTRAINT fk_avaliacao_servico
    FOREIGN KEY (servico_id)
    REFERENCES servicos(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_avaliacao_cliente
    FOREIGN KEY (cliente_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT ck_avaliacao_nota
    CHECK (nota BETWEEN 1 AND 5)
) ENGINE=InnoDB;
