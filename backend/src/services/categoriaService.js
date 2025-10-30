import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

// Buscar todas as categorias
export const getAllCategorias = async (ativo = null) => {
  let sql = `
    SELECT id, nome, descricao, icone, ativo, created_at, updated_at
    FROM categorias
  `;
  
  const params = [];
  
  if (ativo !== null) {
    sql += ' WHERE ativo = $1';
    params.push(ativo === 'true');
  }
  
  sql += ' ORDER BY nome';
  
  const result = await query(sql, params);
  return result.rows;
};

// Buscar categoria por ID
export const getCategoriaById = async (id) => {
  const sql = `
    SELECT id, nome, descricao, icone, ativo, created_at, updated_at
    FROM categorias
    WHERE id = $1
  `;
  
  const result = await query(sql, [id]);
  return result.rows[0];
};

// Criar nova categoria
export const createCategoria = async (categoriaData) => {
  const { nome, descricao, icone, ativo = true } = categoriaData;
  
  const sql = `
    INSERT INTO categorias (nome, descricao, icone, ativo)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  
  const result = await query(sql, [nome, descricao, icone, ativo]);
  return result.rows[0];
};

// Atualizar categoria
export const updateCategoria = async (id, updateData) => {
  const { nome, descricao, icone, ativo } = updateData;
  
  // Construir query dinamicamente
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
  
  if (icone !== undefined) {
    setFields.push(`icone = $${paramCount++}`);
    params.push(icone);
  }
  
  if (ativo !== undefined) {
    setFields.push(`ativo = $${paramCount++}`);
    params.push(ativo);
  }
  
  if (setFields.length === 0) {
    throw new AppError('Nenhum campo para atualizar', 400, 'NO_UPDATE_FIELDS');
  }
  
  setFields.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);
  
  const sql = `
    UPDATE categorias 
    SET ${setFields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;
  
  const result = await query(sql, params);
  return result.rows[0];
};

// Deletar categoria
export const deleteCategoria = async (id) => {
  // Verificar se existem itens usando esta categoria
  const checkSql = 'SELECT COUNT(*) FROM menu_items WHERE categoria_id = $1';
  const checkResult = await query(checkSql, [id]);
  
  if (parseInt(checkResult.rows[0].count) > 0) {
    throw new AppError('Não é possível deletar categoria que possui itens', 400, 'CATEGORY_HAS_ITEMS');
  }
  
  const sql = 'DELETE FROM categorias WHERE id = $1 RETURNING id';
  const result = await query(sql, [id]);
  return result.rows[0];
};