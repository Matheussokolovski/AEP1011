CREATE DATABASE reaproveita;

USE reaproveita;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL, 
    telefone VARCHAR(20),
    tipo_perfil ENUM('DOADOR', 'BENEFICIARIO', 'ADMIN') NOT NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enderecos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    rua VARCHAR(255) NOT NULL,
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE alimentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doador_id INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    quantidade DECIMAL(10, 2) NOT NULL,
    unidade_medida ENUM('UNIDADE', 'KG', 'PACOTE', 'LITRO') NOT NULL,
    data_validade DATE NOT NULL,
    data_postagem TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('DISPONIVEL', 'RESERVADO', 'COLETADO') NOT NULL DEFAULT 'DISPONIVEL',
    
    FOREIGN KEY (doador_id) REFERENCES usuarios(id)
);

CREATE TABLE reservas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alimento_id INT NOT NULL,
    beneficiario_id INT NOT NULL,
    data_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDENTE', 'CONCLUIDA', 'CANCELADA') NOT NULL DEFAULT 'PENDENTE',
    data_retirada_prevista TIMESTAMP NULL,
    data_retirada_efetiva TIMESTAMP NULL,
    
    FOREIGN KEY (alimento_id) REFERENCES alimentos(id),
    FOREIGN KEY (beneficiario_id) REFERENCES usuarios(id)

);
 
