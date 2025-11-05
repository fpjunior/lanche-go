import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

// Buscar todos os itens do menu
export const getAllMenuItems = async (disponivel = null) => {
  let sql = `
    SELECT 
      id, nome, descricao, preco, categoria, imagem, 
      disponivel, ingredientes, tags, created_at, updated_at,
      CASE WHEN image_data IS NOT NULL THEN true ELSE false END as has_image,
      CASE WHEN image_data IS NOT NULL THEN '/api/menu-items/' || id || '/image' ELSE null END as image_url
    FROM menu_items
  `;
  
  const params = [];
  
  if (disponivel !== null) {
    sql += ' WHERE disponivel = $1';
    params.push(disponivel === 'true');
  }
  
  sql += ' ORDER BY categoria, nome';
  
  const result = await query(sql, params);
  return result.rows;
};

// Buscar itens por categoria
export const getMenuItemsByCategory = async (categoria, disponivel = null) => {
  let sql = `
    SELECT 
      id, nome, descricao, preco, categoria, imagem, 
      disponivel, ingredientes, tags, created_at, updated_at,
      CASE WHEN image_data IS NOT NULL THEN true ELSE false END as has_image,
      CASE WHEN image_data IS NOT NULL THEN '/api/menu-items/' || id || '/image' ELSE null END as image_url
    FROM menu_items
    WHERE categoria = $1
  `;
  
  const params = [categoria];
  
  if (disponivel !== null) {
    sql += ' AND disponivel = $2';
    params.push(disponivel === 'true');
  }
  
  sql += ' ORDER BY nome';
  
  const result = await query(sql, params);
  return result.rows;
};

// Buscar itens por termo
export const searchMenuItems = async (searchTerm) => {
  const sql = `
    SELECT 
      id, nome, descricao, preco, categoria, imagem, 
      disponivel, ingredientes, tags, created_at, updated_at,
      CASE WHEN image_data IS NOT NULL THEN true ELSE false END as has_image,
      CASE WHEN image_data IS NOT NULL THEN '/api/menu-items/' || id || '/image' ELSE null END as image_url
    FROM menu_items
    WHERE disponivel = true
      AND (
        LOWER(nome) LIKE LOWER($1) 
        OR LOWER(descricao) LIKE LOWER($1)
        OR EXISTS (
          SELECT 1 FROM unnest(tags) AS tag 
          WHERE LOWER(tag) LIKE LOWER($1)
        )
      )
    ORDER BY 
      CASE 
        WHEN LOWER(nome) LIKE LOWER($2) THEN 1
        WHEN LOWER(nome) LIKE LOWER($1) THEN 2
        ELSE 3
      END,
      nome
  `;
  
  const searchPattern = `%${searchTerm}%`;
  const exactPattern = searchTerm;
  
  const result = await query(sql, [searchPattern, exactPattern]);
  return result.rows;
};

// Buscar item por ID
export const getMenuItemById = async (id) => {
  const sql = `
    SELECT 
      id, nome, descricao, preco, categoria, imagem, 
      disponivel, ingredientes, tags, created_at, updated_at,
      CASE WHEN image_data IS NOT NULL THEN true ELSE false END as has_image,
      CASE WHEN image_data IS NOT NULL THEN '/api/menu-items/' || id || '/image' ELSE null END as image_url
    FROM menu_items
    WHERE id = $1
  `;
  
  const result = await query(sql, [id]);
  return result.rows[0];
};

// Criar novo item
export const createMenuItem = async (itemData) => {
  const {
    nome, descricao, preco, categoria, imagem, 
    disponivel = true, ingredientes = [], tags = []
  } = itemData;
  
  const sql = `
    INSERT INTO menu_items 
    (nome, descricao, preco, categoria, imagem, disponivel, ingredientes, tags)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  
  const result = await query(sql, [
    nome, descricao, preco, categoria, imagem, 
    disponivel, ingredientes, tags
  ]);
  
  return result.rows[0];
};

// Atualizar item
export const updateMenuItem = async (id, updateData) => {
  const {
    nome, descricao, preco, categoria, imagem, 
    disponivel, ingredientes, tags
  } = updateData;
  
  // Construir query dinamicamente baseado nos campos fornecidos
  const setFields = [];
  const params = [];
  let paramCount = 1;
  
  if (nome !== undefined) {
    setFields.push(`nome = $${paramCount++}`);
    params.push(nome);
  }
  
  if (descricao !== undefined) {
    setFields.push(`descricao = $${paramCount++}`);
    params.push(descricao);
  }
  
  if (preco !== undefined) {
    setFields.push(`preco = $${paramCount++}`);
    params.push(preco);
  }
  
  if (categoria !== undefined) {
    setFields.push(`categoria = $${paramCount++}`);
    params.push(categoria);
  }
  
  if (imagem !== undefined) {
    setFields.push(`imagem = $${paramCount++}`);
    params.push(imagem);
  }
  
  if (disponivel !== undefined) {
    setFields.push(`disponivel = $${paramCount++}`);
    params.push(disponivel);
  }
  
  if (ingredientes !== undefined) {
    setFields.push(`ingredientes = $${paramCount++}`);
    params.push(ingredientes);
  }
  
  if (tags !== undefined) {
    setFields.push(`tags = $${paramCount++}`);
    params.push(tags);
  }
  
  if (setFields.length === 0) {
    throw new AppError('Nenhum campo para atualizar', 400, 'NO_UPDATE_FIELDS');
  }
  
  setFields.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);
  
  const sql = `
    UPDATE menu_items 
    SET ${setFields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;
  
  const result = await query(sql, params);
  return result.rows[0];
};

// Deletar item
export const deleteMenuItem = async (id) => {
  const sql = 'DELETE FROM menu_items WHERE id = $1 RETURNING id';
  const result = await query(sql, [id]);
  return result.rows[0];
};

// Atualizar disponibilidade
export const updateDisponibilidade = async (id, disponivel) => {
  const sql = `
    UPDATE menu_items 
    SET disponivel = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  
  const result = await query(sql, [disponivel, id]);
  return result.rows[0];
};

// Atualizar imagem do item
export const updateMenuItemImage = async (id, imagemUrl) => {
  const sql = `
    UPDATE menu_items 
    SET imagem = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  
  const result = await query(sql, [imagemUrl, id]);
  
  if (result.rows.length === 0) {
    throw new AppError('Item do menu não encontrado', 404, 'MENU_ITEM_NOT_FOUND');
  }
  
  return result.rows[0];
};

// Remover imagem do item
export const removeMenuItemImage = async (id) => {
  const sql = `
    UPDATE menu_items 
    SET imagem = NULL, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  
  const result = await query(sql, [id]);
  
  if (result.rows.length === 0) {
    throw new AppError('Item do menu não encontrado', 404, 'MENU_ITEM_NOT_FOUND');
  }
  
  return result.rows[0];
};

// Buscar item com imagem
export const getMenuItemWithImage = async (id) => {
  const sql = `
    SELECT 
      id, nome, descricao, preco, categoria, imagem, 
      disponivel, ingredientes, tags, created_at, updated_at
    FROM menu_items
    WHERE id = $1
  `;
  
  const result = await query(sql, [id]);
  
  if (result.rows.length === 0) {
    throw new AppError('Item do menu não encontrado', 404, 'MENU_ITEM_NOT_FOUND');
  }
  
  return result.rows[0];
};