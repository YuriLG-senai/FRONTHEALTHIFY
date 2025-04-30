CREATE DATABASE IF NOT EXISTS healthify;
USE healthify;

-- Drop as tabelas se existirem
DROP TABLE IF EXISTS Usuarios;
DROP TABLE IF EXISTS Clientes;
DROP TABLE IF EXISTS Nutricionistas;
DROP TABLE IF EXISTS Consultas;
DROP TABLE IF EXISTS PlanosAlimentares;
DROP TABLE IF EXISTS Receitas;
DROP TABLE IF EXISTS PlanoReceitas;
DROP TABLE IF EXISTS ProgressoCliente;

-- Criar a tabela de Usuários
CREATE TABLE Usuarios (
    UsuarioId INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,  
    TipoUsuario ENUM('Cliente', 'Nutricionista') NOT NULL, 
    DataCadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    DataNascimento DATE,
    Sexo ENUM('Masculino', 'Feminino', 'Outro') NULL,
    Telefone VARCHAR(15) NULL,
    Endereco VARCHAR(255) NULL,  
    Ativo TINYINT(1) DEFAULT 1,
    cpf VARCHAR(11) NOT NULL UNIQUE
);

-- Criar a tabela de Clientes
CREATE TABLE Clientes (
    ClienteId INT AUTO_INCREMENT PRIMARY KEY,
    UsuarioId INT,
    Peso DECIMAL(5,2) NULL,
    Altura DECIMAL(5,2) NULL,
    Objetivo VARCHAR(255) NULL,  
    NivelAtividade ENUM('Sedentário', 'Levemente ativo', 'Moderadamente ativo', 'Muito ativo') NULL,
    PreferenciasAlimentares VARCHAR(255) NULL,  
    DoencasPreexistentes VARCHAR(255) NULL, 
    FOREIGN KEY (UsuarioId) REFERENCES Usuarios(UsuarioId)
);

-- Criar a tabela de Nutricionistas
CREATE TABLE Nutricionistas (
    NutricionistaId INT AUTO_INCREMENT PRIMARY KEY,
    UsuarioId INT,
    Especialidade VARCHAR(255) NULL,  
    Descricao VARCHAR(500) NULL, 
    FotoPerfil VARCHAR(255) NULL,  
    FOREIGN KEY (UsuarioId) REFERENCES Usuarios(UsuarioId)
);

-- Create the Consultas table
CREATE TABLE Consultas (
    ConsultaId INT AUTO_INCREMENT PRIMARY KEY,
    ClienteId INT,
    NutricionistaId INT,
    DataConsulta TIMESTAMP NOT NULL,
    TipoConsulta ENUM('Online', 'Presencial') NOT NULL,
    Status ENUM('Agendada', 'Concluída', 'Cancelada') DEFAULT 'Agendada',
    Observacoes VARCHAR(500) NULL,
    FOREIGN KEY (ClienteId) REFERENCES Clientes(ClienteId),
    FOREIGN KEY (NutricionistaId) REFERENCES Nutricionistas(NutricionistaId)
);

-- Create the PlanosAlimentares table
CREATE TABLE PlanosAlimentares (
    PlanoId INT AUTO_INCREMENT PRIMARY KEY,
    ClienteId INT,
    NutricionistaId INT,
    NomePlano VARCHAR(255) NOT NULL,  
    DataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    DataInicio DATE,
    DataFim DATE,
    Observacoes VARCHAR(500) NULL,
    FOREIGN KEY (ClienteId) REFERENCES Clientes(ClienteId),
    FOREIGN KEY (NutricionistaId) REFERENCES Nutricionistas(NutricionistaId)
);

-- Create the Receitas table
CREATE TABLE Receitas (
    ReceitaId INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(255) NOT NULL,
    Ingredientes TEXT NOT NULL,  -- Lista de ingredientes
    Instrucoes TEXT NOT NULL,  -- Como preparar
    CaloriasPorPorcao DECIMAL(5,2) NULL,  -- Calorias por porção
    Categoria VARCHAR(255) NULL,  -- Ex: Café da manhã, almoço, jantar, etc.
    Tipo VARCHAR(255) NULL,  -- Ex: Vegano, sem glúten, sem lactose, etc.
    FotoReceita VARCHAR(255) NULL
);

-- Create the PlanoReceitas table
CREATE TABLE PlanoReceitas (
    PlanoId INT,
    ReceitaId INT,
    QuantidadePorcao INT NOT NULL, 
    PRIMARY KEY (PlanoId, ReceitaId),
    FOREIGN KEY (PlanoId) REFERENCES PlanosAlimentares(PlanoId),
    FOREIGN KEY (ReceitaId) REFERENCES Receitas(ReceitaId)
);

-- Create the ProgressoCliente table
CREATE TABLE ProgressoCliente (
    ProgressoId INT AUTO_INCREMENT PRIMARY KEY,
    ClienteId INT,
    DataRegistro DATETIME DEFAULT CURRENT_TIMESTAMP,
    Peso DECIMAL(5,2) NULL,
    IMC DECIMAL(5,2) NULL, 
    Medidas VARCHAR(255) NULL,  
    Observacoes VARCHAR(500) NULL,
    FOREIGN KEY (ClienteId) REFERENCES Clientes(ClienteId)
);

INSERT INTO Usuarios (Nome, Email, senha, TipoUsuario, DataNascimento, Sexo, Telefone, Endereco, cpf)
VALUES
('Gustavo', 'gustavo.nutri@example.com', 'senha123', 'Nutricionista', '1986-05-10', 'Masculino', '11999990001', 'Rua A, 123', '11111111111'),
('Yuri', 'yuri.nutri@example.com', 'senha123', 'Nutricionista', '1991-08-22', 'Masculino', '11999990002', 'Rua B, 456', '22222222222'),
('Bernardo', 'bernardo.nutri@example.com', 'senha123', 'Nutricionista', '1988-12-05', 'Masculino', '11999990003', 'Rua C, 789', '33333333333');

INSERT INTO Nutricionistas (UsuarioId, Especialidade, Descricao, FotoPerfil)
VALUES
((SELECT UsuarioId FROM Usuarios WHERE Email = 'gustavo.nutri@example.com'), 'Emagrecimento', 'Especialista em emagrecimento saudável.', NULL),
((SELECT UsuarioId FROM Usuarios WHERE Email = 'yuri.nutri@example.com'), 'Nutrição esportiva', 'Atua com atletas e planos de performance.', NULL),
((SELECT UsuarioId FROM Usuarios WHERE Email = 'bernardo.nutri@example.com'), 'Reeducação alimentar', 'Foco em mudança de hábitos alimentares.', NULL);
INSERT INTO Usuarios (Nome, Email, senha, TipoUsuario, DataNascimento, Sexo, Telefone, Endereco, cpf)
VALUES
('Camila Dias', 'camila.cliente@example.com', 'senha123', 'Cliente', '1994-03-15', 'Feminino', '11999991001', 'Av X, 100', '44444444444'),
('Rafael Oliveira', 'rafael.cliente@example.com', 'senha123', 'Cliente', '1990-07-01', 'Masculino', '11999991002', 'Av Y, 200', '55555555555'),
('Letícia Martins', 'leticia.cliente@example.com', 'senha123', 'Cliente', '2001-11-19', 'Feminino', '11999991003', 'Av Z, 300', '66666666666');

-- Inserir dados na tabela Clientes
INSERT INTO Clientes (UsuarioId, Peso, Altura, Objetivo, NivelAtividade, PreferenciasAlimentares, DoencasPreexistentes)
VALUES
((SELECT UsuarioId FROM Usuarios WHERE Email = 'camila.cliente@example.com'), 62.5, 1.67, 'Definição muscular', 'Levemente ativo', 'Vegetariana', 'Nenhuma'),
((SELECT UsuarioId FROM Usuarios WHERE Email = 'rafael.cliente@example.com'), 80.0, 1.78, 'Perder gordura', 'Moderadamente ativo', 'Sem glúten', 'Nenhuma'),
((SELECT UsuarioId FROM Usuarios WHERE Email = 'leticia.cliente@example.com'), 70.0, 1.70, 'Ganho de massa', 'Sedentário', 'Sem lactose', 'Asma');
CREATE INDEX idx_cliente_email ON Usuarios(Email);
CREATE INDEX idx_cliente_nome ON Usuarios(Nome);
CREATE INDEX idx_progresso_cliente ON ProgressoCliente(ClienteId);
CREATE INDEX idx_consulta_data ON Consultas(DataConsulta);

-- Test the tables
SELECT * FROM Usuarios;
SELECT * FROM Clientes;
SELECT * FROM Nutricionistas;
SELECT * FROM Consultas;
