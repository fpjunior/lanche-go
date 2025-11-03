import jwt from 'jsonwebtoken';

/**
 * Gera um token JWT para o usuário
 */
export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    nome: user.nome,
    nivel: user.nivel
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, { 
    expiresIn: '24h' 
  });
};

/**
 * Middleware de autenticação JWT
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      status: 'ERROR',
      message: 'Token de acesso requerido',
      code: 'NO_TOKEN'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        status: 'ERROR',
        message: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN'
      });
    }
    
    req.user = user;
    next();
  });
};

/**
 * Middleware para verificar níveis de acesso (roles)
 * Uso: auth(['admin', 'gerente'])
 */
const auth = (roles = []) => {
  return (req, res, next) => {
    // Primeiro valida o token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Token de acesso requerido',
        code: 'NO_TOKEN'
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          status: 'ERROR',
          message: 'Token inválido ou expirado',
          code: 'INVALID_TOKEN'
        });
      }

      req.user = user;

      // Verifica se o usuário tem o nível necessário
      if (roles.length > 0 && !roles.includes(user.nivel)) {
        return res.status(403).json({
          status: 'ERROR',
          message: 'Acesso não autorizado',
          code: 'NO_PERMISSION',
          nivelRecebido: user.nivel,
          nivelNecessario: roles
        });
      }

      next();
    });
  };
};

/**
 * Middleware para verificar se o usuário tem acesso a um módulo específico
 */
export const checkModuleAccess = (moduleName) => {
  return async (req, res, next) => {
    try {
      const { id: userId } = req.user;
      
      // Admin tem acesso a tudo
      if (req.user.nivel === 'admin') {
        return next();
      }

      // Verificar se o usuário tem acesso ao módulo
      const hasAccess = await checkUserModuleAccess(userId, moduleName);
      
      if (!hasAccess) {
        return res.status(403).json({
          status: 'ERROR',
          message: `Acesso negado ao módulo: ${moduleName}`,
          code: 'MODULE_ACCESS_DENIED'
        });
      }

      next();
    } catch (error) {
      console.error('Erro ao verificar acesso ao módulo:', error);
      return res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

/**
 * Função auxiliar para verificar acesso do usuário a um módulo
 */
const checkUserModuleAccess = async (userId, moduleName) => {
  const { Pool } = await import('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    const query = `
      SELECT 1 
      FROM usuario_modulos um
      JOIN modulos m ON um.modulo_id = m.id
      WHERE um.usuario_id = $1 AND m.nome = $2 AND m.ativo = true
    `;
    
    const result = await pool.query(query, [userId, moduleName]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Erro na consulta de módulo:', error);
    return false;
  } finally {
    await pool.end();
  }
};

export default auth;