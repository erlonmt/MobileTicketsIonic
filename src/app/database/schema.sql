-- ===============================
-- BANCO DE DADOS
-- ===============================
DROP DATABASE IF EXISTS controle_atendimento;
CREATE DATABASE controle_atendimento;
USE controle_atendimento;

-- ===============================
-- TABELA: CLIENTE
-- ===============================
CREATE TABLE cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100)
);

-- ===============================
-- TABELA: GUICHE
-- ===============================
CREATE TABLE guiche (
    id_guiche INT AUTO_INCREMENT PRIMARY KEY,
    numero INT,
    status VARCHAR(20)
);

-- ===============================
-- TABELA: ATENDENTE
-- ===============================
CREATE TABLE atendente (
    id_atendente INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100),
    login VARCHAR(50),
    senha VARCHAR(100)
);

-- ===============================
-- TABELA: SENHA
-- ===============================
CREATE TABLE senha (
    id_senha INT AUTO_INCREMENT PRIMARY KEY,
    codigo_senha VARCHAR(20),
    tipo ENUM('SP','SG','SE'),
    data_emissao DATE,
    hora_emissao TIME,
    status VARCHAR(20),
    sequencial_dia INT,
    id_cliente INT,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
);

-- ===============================
-- TABELA: ATENDIMENTO
-- ===============================
CREATE TABLE atendimento (
    id_atendimento INT AUTO_INCREMENT PRIMARY KEY,
    data_atendimento DATE,
    hora_inicio TIME,
    hora_fim TIME,
    tempo_atendimento INT,
    id_senha INT,
    id_guiche INT,
    id_atendente INT,
    FOREIGN KEY (id_senha) REFERENCES senha(id_senha),
    FOREIGN KEY (id_guiche) REFERENCES guiche(id_guiche),
    FOREIGN KEY (id_atendente) REFERENCES atendente(id_atendente)
);

-- ===============================
-- TABELA: PAINEL
-- ===============================
CREATE TABLE painel_senhas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_senha INT,
    data_hora_chamada DATETIME,
    FOREIGN KEY (id_senha) REFERENCES senha(id_senha)
);