import pkg from 'pg';
import pool from '../config/database.js';
const { Pool } = pkg;

class PedidosService {
  constructor() {
    this.pool = pool;
  }

  async criarPedido(dadosPedido) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Inserir pedido
      const { rows: [pedido] } = await client.query(
        `INSERT INTO pedidos (cliente_nome, cliente_telefone, mesa, total, observacoes_gerais)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [
          dadosPedido.cliente_nome,
          dadosPedido.cliente_telefone,
          dadosPedido.endereco_entrega || null, // usar endereco_entrega como mesa
          dadosPedido.total,
          dadosPedido.observacoes
        ]
      );

      // Inserir itens do pedido
      const itens = [];
      for (const item of dadosPedido.itens) {
        const { rows: [itemPedido] } = await client.query(
          `INSERT INTO itens_pedido (pedido_id, menu_item_id, nome_item, preco_unitario, quantidade, subtotal, observacoes)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [
            pedido.id,
            item.menu_item_id,
            item.nome_item,
            item.preco_unitario,
            item.quantidade,
            item.subtotal,
            item.observacoes
          ]
        );
        itens.push(itemPedido);
      }

      await client.query('COMMIT');
      
      return {
        ...pedido,
        itens
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async buscarPedidos(filtros = {}) {
    let query = `
      SELECT p.*, 
             json_agg(
               json_build_object(
                 'id', i.id,
                 'menu_item_id', i.menu_item_id,
                 'nome_item', i.nome_item,
                 'preco_unitario', i.preco_unitario,
                 'quantidade', i.quantidade,
                 'subtotal', i.subtotal,
                 'observacoes', i.observacoes
               )
             ) as itens
      FROM pedidos p
      LEFT JOIN itens_pedido i ON p.id = i.pedido_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    if (filtros.status) {
      query += ` AND p.status = $${paramIndex}`;
      params.push(filtros.status);
      paramIndex++;
    }

    if (filtros.cliente_telefone) {
      query += ` AND p.cliente_telefone = $${paramIndex}`;
      params.push(filtros.cliente_telefone);
      paramIndex++;
    }

    query += ` GROUP BY p.id ORDER BY p.created_at DESC`;

    if (filtros.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filtros.limit);
      paramIndex++;
    }

    const { rows } = await this.pool.query(query, params);
    return rows;
  }

  async buscarPedidoPorId(id) {
    const { rows } = await this.pool.query(
      `SELECT p.*, 
             json_agg(
               json_build_object(
                 'id', i.id,
                 'menu_item_id', i.menu_item_id,
                 'nome_item', i.nome_item,
                 'preco_unitario', i.preco_unitario,
                 'quantidade', i.quantidade,
                 'subtotal', i.subtotal,
                 'observacoes', i.observacoes
               )
             ) as itens
      FROM pedidos p
      LEFT JOIN itens_pedido i ON p.id = i.pedido_id
      WHERE p.id = $1
      GROUP BY p.id`,
      [id]
    );
    
    return rows[0] || null;
  }

  async atualizarStatusPedido(id, novoStatus) {
    const { rows: [pedido] } = await this.pool.query(
      'UPDATE pedidos SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [novoStatus, id]
    );
    return pedido;
  }

  async deletarPedido(id) {
    const { rowCount } = await this.pool.query('DELETE FROM pedidos WHERE id = $1', [id]);
    return rowCount > 0;
  }
}

export default new PedidosService();