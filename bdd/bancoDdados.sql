CREATE DATABASE healthify;
USE healthify;

CREATE TABLE Usuarios (
    UsuarioId INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    SenhaHash VARCHAR(255) NOT NULL,  
    TipoUsuario ENUM('Cliente', 'Nutricionista') NOT NULL, 
    DataCadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    DataNascimento DATE,
    Sexo ENUM('Masculino', 'Feminino', 'Outro') NULL,
    Telefone VARCHAR(15) NULL,
    Endereco VARCHAR(255) NULL,
    FotoPerfil VARCHAR(255) NULL,  
    Ativo TINYINT(1) DEFAULT 1 
);

CREATE TABLE Clientes (
    ClienteId INT PRIMARY KEY,
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
    NutricionistaId INT PRIMARY KEY,
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
    DataConsulta DATETIME NOT NULL,
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
    Ingredientes TEXT NOT NULL,  -- Lista de ingredientes
    Instrucoes TEXT NOT NULL,  -- Como preparar
    CaloriasPorPorcao DECIMAL(5,2) NULL,  -- Calorias por porção
    Categoria VARCHAR(255) NULL,  -- Ex: Café da manhã, almoço, jantar, etc.
    Tipo VARCHAR(255) NULL,  -- Ex: Vegano, sem glúten, sem lactose, etc.
    FotoReceita VARCHAR(255) NULL
);

CREATE TABLE PlanoReceitas (
    PlanoId INT,
    ReceitaId INT,
    QuantidadePorcao INT NOT NULL, 
    PRIMARY KEY (PlanoId, ReceitaId),
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

CREATE INDEX idx_cliente_email ON Usuarios(Email);
CREATE INDEX idx_cliente_nome ON Usuarios(Nome);
CREATE INDEX idx_progresso_cliente ON ProgressoCliente(ClienteId);
CREATE INDEX idx_consulta_data ON Consultas(DataConsulta);



		