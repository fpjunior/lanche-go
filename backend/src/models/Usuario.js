import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

class Usuario {
  /**
   * Busca usuário por email - usando abordagem simples como prontuário
   */
  static async findByEmail(email) {
    const query = `SELECT * FROM usuarios WHERE email = $1`;
    const values = [email];
    
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Busca usuário por ID - usando abordagem simples como prontuário
   */
  static async findById(id) {
    const query = `SELECT * FROM usuarios WHERE id = $1`;
    const values = [id];
    
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Cria um novo usuário
   */
  static async createUser(userData) {
    const { nome, email, senha, nivel = 'USER', modulos = [] } = userData;
    
    const hashedPassword = await bcrypt.hash(senha, 10);
    
    const query = `
      INSERT INTO usuarios (nome, email, senha, nivel, modulos, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;
    
    const values = [nome, email, hashedPassword, nivel, modulos];
    const result = await pool.query(query, values);
    
    return result.rows[0];
  }
}

export default Usuario;