-- Criação das tabelas principais do LancheGo

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum para categorias de menu
CREATE TYPE categoria_enum AS ENUM ('lanche', 'bebida', 'sobremesa', 'petisco');

-- Enum para status de pedidos  
CREATE TYPE status_pedido_enum AS ENUM ('novo', 'confirmado', 'preparando', 'pronto', 'entregue', 'cancelado');

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    icone VARCHAR(50),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens do menu
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    categoria categoria_enum NOT NULL,
    imagem VARCHAR(255),
    disponivel BOOLEAN DEFAULT true,
    ingredientes TEXT[], -- Array de strings
    tags TEXT[], -- Array de strings  
    categoria_id INTEGER REFERENCES categorias(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    total DECIMAL(10,2) NOT NULL,
    status status_pedido_enum DEFAULT 'novo',
    observacoes_gerais TEXT,
    mesa VARCHAR(10),
    cliente_nome VARCHAR(100), -- Para pedidos sem cadastro
    cliente_telefone VARCHAR(20), -- Para pedidos sem cadastro
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS pedido_itens (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES menu_items(id),
    quantidade INTEGER NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_menu_items_categoria ON menu_items(categoria);
CREATE INDEX IF NOT EXISTS idx_menu_items_disponivel ON menu_items(disponivel);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON pedidos(created_at);
CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido_id ON pedido_itens(pedido_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- SISTEMA DE AUTENTICAÇÃO E USUÁRIOS
-- ================================

-- Criar tabela de módulos do sistema
CREATE TABLE IF NOT EXISTS modulos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) UNIQUE NOT NULL,
  descricao VARCHAR(200),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  nome VARCHAR(100) NOT NULL,
  nivel VARCHAR(20) NOT NULL DEFAULT 'usuario',
  ativo BOOLEAN DEFAULT TRUE,
  reset_token VARCHAR(255),
  reset_token_expira TIMESTAMP,
  reset_token_usado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de relacionamento usuário-módulos
CREATE TABLE IF NOT EXISTS usuario_modulos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  modulo_id INTEGER NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, modulo_id)
);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir módulos padrão do sistema LancheGo
INSERT INTO modulos (nome, descricao) VALUES 
('dashboard', 'Painel principal com estatísticas'),
('pedidos', 'Gerenciamento de pedidos'),
('produtos', 'Cadastro e gestão de produtos'),
('clientes', 'Gestão de clientes'),
('financeiro', 'Controle financeiro e relatórios'),
('configuracoes', 'Configurações do sistema'),
('usuarios', 'Gestão de usuários e permissões')
ON CONFLICT (nome) DO NOTHING;

-- Inserir usuário de teste: Breno Henrique
-- Senha: 123456 (hash bcrypt)
INSERT INTO usuarios (email, senha, nome, nivel) VALUES 
('brenohdias123@gmail.com', '$2a$10$K7L/8alBXzJ1VhJnIU.8vO0pVzl9sKnAzJ1LhxtjAl9EQTgWbtWxK', 'Breno Henrique', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Dar acesso a todos os módulos para o usuário de teste (admin)
INSERT INTO usuario_modulos (usuario_id, modulo_id) 
SELECT u.id, m.id 
FROM usuarios u 
CROSS JOIN modulos m 
WHERE u.email = 'brenohdias123@gmail.com' AND m.ativo = true
ON CONFLICT (usuario_id, modulo_id) DO NOTHING;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);
CREATE INDEX IF NOT EXISTS idx_usuario_modulos_usuario ON usuario_modulos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuario_modulos_modulo ON usuario_modulos(modulo_id);