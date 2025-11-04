import Usuario from '../models/Usuario.js';
import { generateToken } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class AuthController {
  /**
   * Login do usuário
   * @route POST /api/auth/login
   */
  static async login(req, res) {
    try {
      const { email, senha } = req.body;

      console.log('🔑 [AUTH] Tentativa de login:', { email, senhaLength: senha?.length });

      // Validações básicas
      if (!email || !senha) {
        console.log('❌ [AUTH] Credenciais faltantes');
        return res.status(400).json({
          status: 'ERROR',
          message: 'Email e senha são obrigatórios',
          code: 'MISSING_CREDENTIALS'
        });
      }

      // Buscar usuário
      console.log('🔍 [AUTH] Buscando usuário por email:', email);
      const usuario = await Usuario.findByEmail(email);
      
      if (!usuario) {
        console.log('❌ [AUTH] Usuário não encontrado:', email);
        return res.status(401).json({
          status: 'ERROR',
          message: 'Credenciais inválidas',
          code: 'INVALID_CREDENTIALS'
        });
      }

      console.log('👤 [AUTH] Usuário encontrado:', { id: usuario.id, email: usuario.email, nome: usuario.nome });

      // Verificar senha usando bcrypt.compare diretamente
      console.log('🔐 [AUTH] Verificando senha...');
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      
      if (!senhaValida) {
        console.log('❌ [AUTH] Senha inválida para:', email);
        return res.status(401).json({
          status: 'ERROR',
          message: 'Credenciais inválidas',
          code: 'INVALID_CREDENTIALS'
        });
      }

      console.log('✅ [AUTH] Senha válida, gerando token...');

      // Gerar token incluindo módulos
      const token = generateToken({
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        nivel: usuario.nivel,
        modulos: usuario.modulos
      });

      console.log(`✅ [AUTH] Login realizado: ${usuario.email}`);

      // Resposta de sucesso
      res.json({
        status: 'SUCCESS',
        message: 'Login realizado com sucesso',
        data: {
          token,
          usuario: {
            id: usuario.id,
            email: usuario.email,
            nome: usuario.nome,
            nivel: usuario.nivel,
            modulos: usuario.modulos
          }
        }
      });

    } catch (error) {
      console.error('❌ [AUTH] Erro no login:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Verificar token e retornar dados do usuário
   * @route GET /api/auth/me
   */
  static async me(req, res) {
    try {
      const usuario = await Usuario.findById(req.user.id);
      
      if (!usuario) {
        return res.status(404).json({
          status: 'ERROR',
          message: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND'
        });
      }

      res.json({
        status: 'SUCCESS',
        data: {
          usuario: usuario.toJSON()
        }
      });

    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Logout (invalidação do token no client-side)
   * @route POST /api/auth/logout
   */
  static async logout(req, res) {
    try {
      // O logout é feito no client-side removendo o token
      // Aqui podemos apenas retornar sucesso
      res.json({
        status: 'SUCCESS',
        message: 'Logout realizado com sucesso'
      });

    } catch (error) {
      console.error('Erro no logout:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Verificar permissões do usuário
   * @route GET /api/auth/permissions
   */
  static async permissions(req, res) {
    try {
      const usuario = await Usuario.findById(req.user.id);
      
      if (!usuario) {
        return res.status(404).json({
          status: 'ERROR',
          message: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND'
        });
      }

      res.json({
        status: 'SUCCESS',
        data: {
          nivel: usuario.nivel,
          modulos: usuario.modulos || [],
          permissions: {
            canManageUsers: usuario.nivel === 'admin',
            canViewReports: ['admin', 'gerente'].includes(usuario.nivel),
            canEditProducts: ['admin', 'gerente', 'funcionario'].includes(usuario.nivel)
          }
        }
      });

    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Alterar senha do usuário logado
   * @route PUT /api/auth/change-password
   */
  static async changePassword(req, res) {
    try {
      const { senhaAtual, novaSenha } = req.body;

      // Validações
      if (!senhaAtual || !novaSenha) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Senha atual e nova senha são obrigatórias',
          code: 'MISSING_PASSWORDS'
        });
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'A nova senha deve ter pelo menos 6 caracteres',
          code: 'PASSWORD_TOO_SHORT'
        });
      }

      // Buscar usuário
      const usuario = await Usuario.findById(req.user.id);
      
      if (!usuario) {
        return res.status(404).json({
          status: 'ERROR',
          message: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND'
        });
      }

      // Verificar senha atual
      const senhaValida = await usuario.verifyPassword(senhaAtual);
      
      if (!senhaValida) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Senha atual incorreta',
          code: 'INVALID_CURRENT_PASSWORD'
        });
      }

      // Atualizar senha
      await usuario.updatePassword(novaSenha);

      res.json({
        status: 'SUCCESS',
        message: 'Senha alterada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Solicitar recuperação de senha
   * @route POST /api/auth/forgot-password
   */
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Email é obrigatório',
          code: 'MISSING_EMAIL'
        });
      }

      const usuario = await Usuario.findByEmail(email);
      
      if (!usuario) {
        // Por segurança, sempre retornamos sucesso mesmo se o email não existir
        return res.json({
          status: 'SUCCESS',
          message: 'Se o email existir, você receberá as instruções de recuperação'
        });
      }

      // Gerar token de recuperação
      const resetToken = jwt.sign(
        { 
          userId: usuario.id, 
          type: 'password-reset' 
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Salvar token no banco
      const expiraEm = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
      await Usuario.update(usuario.id, {
        reset_token: resetToken,
        reset_token_expira: expiraEm,
        reset_token_usado: false
      });

      // TODO: Implementar envio de email
      console.log(`🔑 Token de recuperação para ${email}: ${resetToken}`);

      res.json({
        status: 'SUCCESS',
        message: 'Se o email existir, você receberá as instruções de recuperação',
        // Em desenvolvimento, retornar o token para testes
        ...(process.env.NODE_ENV === 'development' && { debug_token: resetToken })
      });

    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Redefinir senha usando token
   * @route POST /api/auth/reset-password
   */
  static async resetPassword(req, res) {
    try {
      const { token, novaSenha } = req.body;

      if (!token || !novaSenha) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Token e nova senha são obrigatórios',
          code: 'MISSING_DATA'
        });
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'A senha deve ter pelo menos 6 caracteres',
          code: 'PASSWORD_TOO_SHORT'
        });
      }

      // Verificar token
      let payload;
      try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Token inválido ou expirado',
          code: 'INVALID_TOKEN'
        });
      }

      if (payload.type !== 'password-reset') {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Tipo de token inválido',
          code: 'INVALID_TOKEN_TYPE'
        });
      }

      // Buscar usuário
      const usuario = await Usuario.findById(payload.userId);
      
      if (!usuario) {
        return res.status(404).json({
          status: 'ERROR',
          message: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND'
        });
      }

      // Verificar se o token ainda é válido
      if (usuario.reset_token !== token || usuario.reset_token_usado) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Este link de redefinição já foi utilizado ou expirou',
          code: 'TOKEN_ALREADY_USED'
        });
      }

      // Atualizar senha e marcar token como usado
      await Usuario.update(usuario.id, {
        senha: novaSenha,
        reset_token_usado: true
      });

      res.json({
        status: 'SUCCESS',
        message: 'Senha redefinida com sucesso'
      });

    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Verificar se o token ainda é válido
   * @route GET /api/auth/verify
   */
  static async verifyToken(req, res) {
    try {
      // Se chegou até aqui, o token é válido (middleware authenticateToken já verificou)
      const user = req.user;
      
      // Verificar se o usuário ainda existe no banco
      const usuario = await Usuario.findById(user.id);
      if (!usuario) {
        return res.status(401).json({
          status: 'ERROR',
          message: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND'
        });
      }

      // Calcular tempo restante do token
      const now = Math.floor(Date.now() / 1000);
      const timeRemaining = user.exp - now;

      res.json({
        status: 'SUCCESS',
        data: {
          valid: true,
          user: {
            id: usuario.id,
            email: usuario.email,
            nome: usuario.nome,
            nivel: usuario.nivel,
            modulos: usuario.modulos
          },
          expiresIn: timeRemaining,
          expiresAt: new Date(user.exp * 1000)
        }
      });
    } catch (error) {
      console.error('❌ [AUTH] Erro na verificação do token:', error);
      res.status(500).json({ 
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Logout do usuário
   * @route POST /api/auth/logout
   */
  static async logout(req, res) {
    try {
      // Com JWT stateless, o logout é basicamente informativo
      // O frontend deve remover o token do localStorage
      console.log(`🚪 [AUTH] Logout realizado: ${req.user?.email || 'usuário'}`);
      
      res.json({
        status: 'SUCCESS',
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      console.error('❌ [AUTH] Erro no logout:', error);
      res.status(500).json({ 
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }
}

export default AuthController;