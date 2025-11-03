import Usuario from '../models/Usuario.js';

class UsuariosController {
  /**
   * Listar todos os usuários
   * @route GET /api/usuarios
   */
  static async index(req, res) {
    try {
      const { ativo, nivel } = req.query;
      
      const filters = {};
      if (ativo !== undefined) filters.ativo = ativo === 'true';
      if (nivel) filters.nivel = nivel;

      const usuarios = await Usuario.findAll(filters);

      res.json({
        status: 'SUCCESS',
        data: usuarios
      });

    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Buscar usuário por ID
   * @route GET /api/usuarios/:id
   */
  static async show(req, res) {
    try {
      const { id } = req.params;
      
      const usuario = await Usuario.findById(id);
      
      if (!usuario) {
        return res.status(404).json({
          status: 'ERROR',
          message: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND'
        });
      }

      res.json({
        status: 'SUCCESS',
        data: usuario.toJSON()
      });

    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Criar novo usuário
   * @route POST /api/usuarios
   */
  static async create(req, res) {
    try {
      const { email, senha, nome, nivel, modulos } = req.body;

      // Validações básicas
      if (!email || !senha || !nome) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Email, senha e nome são obrigatórios',
          code: 'MISSING_REQUIRED_FIELDS'
        });
      }

      if (senha.length < 6) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'A senha deve ter pelo menos 6 caracteres',
          code: 'PASSWORD_TOO_SHORT'
        });
      }

      // Verificar se email já existe
      const usuarioExistente = await Usuario.findByEmail(email);
      
      if (usuarioExistente) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Email já está em uso',
          code: 'EMAIL_ALREADY_EXISTS'
        });
      }

      // Criar usuário
      const novoUsuario = await Usuario.create({
        email,
        senha,
        nome,
        nivel: nivel || 'usuario',
        modulos: modulos || []
      });

      res.status(201).json({
        status: 'SUCCESS',
        message: 'Usuário criado com sucesso',
        data: novoUsuario.toJSON()
      });

    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Atualizar usuário
   * @route PUT /api/usuarios/:id
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { email, senha, nome, nivel, modulos, ativo } = req.body;

      // Verificar se usuário existe
      const usuario = await Usuario.findById(id);
      
      if (!usuario) {
        return res.status(404).json({
          status: 'ERROR',
          message: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND'
        });
      }

      // Verificar se email já está em uso por outro usuário
      if (email && email !== usuario.email) {
        const emailExistente = await Usuario.findByEmail(email);
        if (emailExistente) {
          return res.status(400).json({
            status: 'ERROR',
            message: 'Email já está em uso',
            code: 'EMAIL_ALREADY_EXISTS'
          });
        }
      }

      // Validar senha se fornecida
      if (senha && senha.length < 6) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'A senha deve ter pelo menos 6 caracteres',
          code: 'PASSWORD_TOO_SHORT'
        });
      }

      // Preparar dados para atualização
      const updateData = {};
      if (email) updateData.email = email;
      if (senha) updateData.senha = senha;
      if (nome) updateData.nome = nome;
      if (nivel) updateData.nivel = nivel;
      if (modulos) updateData.modulos = modulos;
      if (ativo !== undefined) updateData.ativo = ativo;

      // Atualizar usuário
      const usuarioAtualizado = await Usuario.update(id, updateData);

      res.json({
        status: 'SUCCESS',
        message: 'Usuário atualizado com sucesso',
        data: usuarioAtualizado.toJSON()
      });

    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Remover usuário (soft delete)
   * @route DELETE /api/usuarios/:id
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;

      // Verificar se usuário existe
      const usuario = await Usuario.findById(id);
      
      if (!usuario) {
        return res.status(404).json({
          status: 'ERROR',
          message: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND'
        });
      }

      // Impedir auto-exclusão
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Você não pode excluir sua própria conta',
          code: 'CANNOT_DELETE_SELF'
        });
      }

      // Remover usuário (soft delete)
      await Usuario.delete(id);

      res.json({
        status: 'SUCCESS',
        message: 'Usuário removido com sucesso'
      });

    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Listar módulos disponíveis
   * @route GET /api/usuarios/modulos
   */
  static async getModulos(req, res) {
    try {
      const pool = (await import('../config/database.js')).default;
      
      const result = await pool.query(`
        SELECT id, nome, descricao, ativo 
        FROM modulos 
        WHERE ativo = true 
        ORDER BY nome
      `);

      res.json({
        status: 'SUCCESS',
        data: result.rows
      });

    } catch (error) {
      console.error('Erro ao listar módulos:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }
}

export default UsuariosController;