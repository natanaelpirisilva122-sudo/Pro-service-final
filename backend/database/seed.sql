USE db_ProService;

INSERT INTO habilidades (nome, categoria) VALUES
  ('Instalação elétrica', 'Elétrica'),
  ('Manutenção elétrica', 'Elétrica'),
  ('Instalação de torneiras', 'Hidráulica'),
  ('Reparo de vazamentos', 'Hidráulica'),
  ('Pintura residencial', 'Pintura'),
  ('Reforma residencial', 'Reformas'),
  ('Instalação de ar-condicionado', 'Climatização'),
  ('Manutenção de computadores', 'Informática'),
  ('Montagem de móveis', 'Marcenaria'),
  ('Limpeza residencial', 'Limpeza')
ON DUPLICATE KEY UPDATE nome = VALUES(nome);
