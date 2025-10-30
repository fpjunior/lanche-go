import { query, transaction } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

// Buscar todos os pedidos
export const getAllPedidos = async (options = {}) => {
  const { status, limite = 50, offset = 0 } = options;
  
  let sql = `
    SELECT 
      p.id, p.total, p.status, p.observacoes_gerais, p.mesa,
      p.cliente_nome, p.cliente_telefone, p.created_at, p.updated_at,
      COALESCE(
        json_agg(
          json_build_object(
            'id', pi.id,
            'menu_item_id', pi.menu_item_id,
            'quantidade', pi.quantidade,
            'preco_unitario', pi.preco_unitario,
            'subtotal', pi.subtotal,
            'observacoes', pi.observacoes,
            'menu_item', json_build_object(
              'id', mi.id,
              'nome', mi.nome,
              'descricao', mi.descricao,
              'categoria', mi.categoria,
              'imagem', mi.imagem
            )
          )
        ) FILTER (WHERE pi.id IS NOT NULL), '[]'::json
      ) AS itens
    FROM pedidos p
    LEFT JOIN pedido_itens pi ON p.id = pi.pedido_id
    LEFT JOIN menu_items mi ON pi.menu_item_id = mi.id
  `;
  
  const params = [];
  let paramCount = 1;
  
  if (status) {
    sql += ` WHERE p.status = $${paramCount++}`;
    params.push(status);
  }
  
  sql += `
    GROUP BY p.id, p.total, p.status, p.observacoes_gerais, p.mesa,
             p.cliente_nome, p.cliente_telefone, p.created_at, p.updated_at
    ORDER BY p.created_at DESC
    LIMIT $${paramCount++} OFFSET $${paramCount++}
  `;
  
  params.push(limite, offset);
  
  const result = await query(sql, params);
  return result.rows;
};

// Buscar pedido por ID
export const getPedidoById = async (id) => {
  const sql = `
    SELECT 
      p.id, p.total, p.status, p.observacoes_gerais, p.mesa,
      p.cliente_nome, p.cliente_telefone, p.created_at, p.updated_at,
      COALESCE(
        json_agg(
          json_build_object(
            'id', pi.id,
            'menu_item_id', pi.menu_item_id,
            'quantidade', pi.quantidade,
            'preco_unitario', pi.preco_unitario,
            'subtotal', pi.subtotal,
            'observacoes', pi.observacoes,
            'menu_item', json_build_object(
              'id', mi.id,
              'nome', mi.nome,
              'descricao', mi.descricao,
              'categoria', mi.categoria,
              'imagem', mi.imagem
            )
          )
        ) FILTER (WHERE pi.id IS NOT NULL), '[]'::json
      ) AS itens
    FROM pedidos p
    LEFT JOIN pedido_itens pi ON p.id = pi.pedido_id
    LEFT JOIN menu_items mi ON pi.menu_item_id = mi.id
    WHERE p.id = $1
    GROUP BY p.id, p.total, p.status, p.observacoes_gerais, p.mesa,
             p.cliente_nome, p.cliente_telefone, p.created_at, p.updated_at
  `;
  
  const result = await query(sql, [id]);
  return result.rows[0];
};

// Criar novo pedido
export const createPedido = async (pedidoData) => {
  const {
    itens, total, observacoes_gerais, mesa, 
    cliente_nome, cliente_telefone
  } = pedidoData;
  
  return await transaction(async (client) => {
    // Inserir pedido
    const pedidoSql = `
      INSERT INTO pedidos 
      (total, observacoes_gerais, mesa, cliente_nome, cliente_telefone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const pedidoResult = await client.query(pedidoSql, [
      total, observacoes_gerais, mesa, cliente_nome, cliente_telefone
    ]);
    
    const novoPedido = pedidoResult.rows[0];
    
    // Inserir itens do pedido
    const itensPromises = itens.map(async (item) => {
      const itemSql = `
        INSERT INTO pedido_itens 
        (pedido_id, menu_item_id, quantidade, preco_unitario, subtotal, observacoes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      return await client.query(itemSql, [
        novoPedido.id,
        item.menu_item_id,
        item.quantidade,
        item.preco_unitario,
        item.subtotal,
        item.observacoes
      ]);
    });
    
    await Promise.all(itensPromises);
    
    // Buscar pedido completo para retornar
    return await getPedidoById(novoPedido.id);
  });
};

// Atualizar pedido
export const updatePedido = async (id, updateData) => {
  const {
    total, status, observacoes_gerais, mesa, 
    cliente_nome, cliente_telefone
  } = updateData;
  
  // Construir query dinamicamente
  const setFields = [];
  const params = [];
  let paramCount = 1;
  
  if (total !== undefined) {
    setFields.push(`total = $${paramCount++}`);
    params.push(total);
  }
  
  if (status !== undefined) {
    setFields.push(`status = $${paramCount++}`);
    params.push(status);
  }
  
  if (observacoes_gerais !== undefined) {
    setFields.push(`observacoes_gerais = $${paramCount++}`);
    params.push(observacoes_gerais);
  }
  
  if (mesa !== undefined) {
    setFields.push(`mesa = $${paramCount++}`);
    params.push(mesa);
  }
  
  if (cliente_nome !== undefined) {
    setFields.push(`cliente_nome = $${paramCount++}`);
    params.push(cliente_nome);
  }
  
  if (cliente_telefone !== undefined) {
    setFields.push(`cliente_telefone = $${paramCount++}`);
    params.push(cliente_telefone);
  }
  
  if (setFields.length === 0) {
    throw new AppError('Nenhum campo para atualizar', 400, 'NO_UPDATE_FIELDS');
  }
  
  setFields.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);
  
  const sql = `
    UPDATE pedidos 
    SET ${setFields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;
  
  const result = await query(sql, params);
  
  if (result.rows[0]) {
    return await getPedidoById(id);
  }
  
  return null;
};

// Atualizar status do pedido
export const updateStatusPedido = async (id, status) => {
  const sql = `
    UPDATE pedidos 
    SET status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  
  const result = await query(sql, [status, id]);
  
  if (result.rows[0]) {
    return await getPedidoById(id);
  }
  
  return null;
};

// Cancelar pedido
export const cancelPedido = async (id) => {
  return await updateStatusPedido(id, 'cancelado');
};

// Buscar pedidos por status
export const getPedidosByStatus = async (status, options = {}) => {
  return await getAllPedidos({ ...options, status });
};