CREATE DATABASE IF NOT EXISTS healthify;
USE healthify;


DROP TABLE IF EXISTS Usuarios;
DROP TABLE IF EXISTS Clientes;
DROP TABLE IF EXISTS Nutricionistas;
DROP TABLE IF EXISTS Consultas;
DROP TABLE IF EXISTS PlanosAlimentares;
DROP TABLE IF EXISTS Receitas;
DROP TABLE IF EXISTS PlanoReceitas;
DROP TABLE IF EXISTS ProgressoCliente;


CREATE TABLE IF NOT EXISTS Perguntas (
    PerguntaId INT PRIMARY KEY,
    Texto VARCHAR(255) NOT NULL
);
INSERT INTO Perguntas (PerguntaId, Texto) VALUES
(1, '☀️ Você costuma tomar café da manhã?'),
(2, 'Quantas refeições você faz por dia?'),
(3, 'Quantos litros de água você bebe por dia?'),
(4, 'Você consome alimentos industrializados com frequência?'),
(5, 'Você come frutas e verduras todos os dias?'),
(6, 'Você pratica atividades físicas regularmente?'),
(7, 'Quantas horas de sono você tem por noite, em média?'),
(8, 'Como você avaliaria seu nível de estresse atualmente?'),
(9, 'Você trabalha em casa ou em home office?'),
(10, 'Quanto tempo você passa em frente a telas (computador, celular, TV) por dia?'),
(11, 'Você tem momentos de descanso durante o seu dia? 🌿');

CREATE TABLE IF NOT EXISTS QuestionarioRespostas (
    QuestionarioRespostaId INT PRIMARY KEY AUTO_INCREMENT,
    ClienteId INT NOT NULL,
    PerguntaId INT NOT NULL,
    RespostaTexto VARCHAR(255) NOT NULL,
    DataResposta DATETIME NOT NULL,
    FOREIGN KEY (ClienteId) REFERENCES Clientes(ClienteId),
    FOREIGN KEY (PerguntaId) REFERENCES Perguntas(PerguntaId)
);

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

CREATE TABLE Nutricionistas (
    NutricionistaId INT AUTO_INCREMENT PRIMARY KEY,
    UsuarioId INT,
    Especialidade VARCHAR(255) NULL,  
    Descricao VARCHAR(500) NULL, 
    FotoPerfil VARCHAR(255) NULL,  
    FOREIGN KEY (UsuarioId) REFERENCES Usuarios(UsuarioId)
);

CREATE TABLE Consultas (
    ConsultaId INT AUTO_INCREMENT PRIMARY KEY,
    ClienteId INT,
    NutricionistaId INT,
    DataConsulta TIMESTAMP NOT NULL,
    HoraConsulta VARCHAR(5) NOT NULL,
    TipoConsulta ENUM('Online', 'Presencial') NOT NULL,
    Status ENUM('Agendada', 'Concluída', 'Cancelada') DEFAULT 'Agendada',
    Observacoes VARCHAR(500) NULL,
    FOREIGN KEY (ClienteId) REFERENCES Clientes(ClienteId),
    FOREIGN KEY (NutricionistaId) REFERENCES Nutricionistas(NutricionistaId)
);

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

CREATE TABLE Receitas (
    ReceitaId INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(255) NOT NULL,
    Ingredientes TEXT NOT NULL,  
    Instrucoes TEXT NOT NULL,  
    CaloriasPorPorcao DECIMAL(5,2) NULL,  
    Categoria VARCHAR(255) NULL,  
    Tipo VARCHAR(255) NULL,  
    FotoReceita VARCHAR(255) NULL
);

CREATE TABLE PlanoReceitas (
    PlanoId INT,
    ReceitaId INT,
    QuantidadePorcao INT NOT NULL,
    DiaSemana ENUM('Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo') NOT NULL,
    Refeicao ENUM('Café','Lanche','Almoço','Jantar','Ceia') NOT NULL,
    PRIMARY KEY (PlanoId, ReceitaId, DiaSemana, Refeicao),
    FOREIGN KEY (PlanoId) REFERENCES PlanosAlimentares(PlanoId),
    FOREIGN KEY (ReceitaId) REFERENCES Receitas(ReceitaId)
);

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
SELECT * FROM Perguntas;
SELECT * FROM QuestionarioRespostas;