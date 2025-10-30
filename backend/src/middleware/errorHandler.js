// Middleware para tratamento de erros
export const errorHandler = (err, req, res, next) => {
  // Log do erro
  console.error('❌ Erro capturado pelo middleware:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Erros de validação do Joi
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      details: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  // Erros de banco de dados PostgreSQL
  if (err.code) {
    switch (err.code) {
      case '23505': // Violação de constraint unique
        return res.status(409).json({
          success: false,
          message: 'Registro já existe',
          error: 'DUPLICATE_ENTRY'
        });
      
      case '23503': // Violação de foreign key
        return res.status(400).json({
          success: false,
          message: 'Referência inválida',
          error: 'FOREIGN_KEY_VIOLATION'
        });
      
      case '23502': // Violação de not null
        return res.status(400).json({
          success: false,
          message: 'Campo obrigatório não informado',
          error: 'NOT_NULL_VIOLATION'
        });
      
      case '42P01': // Tabela não existe
        return res.status(500).json({
          success: false,
          message: 'Erro interno do servidor',
          error: 'TABLE_NOT_FOUND'
        });
    }
  }

  // Erros customizados da aplicação
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.error || 'CUSTOM_ERROR'
    });
  }

  // Erro padrão do servidor
  const statusCode = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Erro interno do servidor' 
    : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    error: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Middleware para capturar rotas não encontradas
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Rota ${req.method} ${req.originalUrl} não encontrada`,
    error: 'NOT_FOUND'
  });
};

// Classe para erros customizados
export class AppError extends Error {
  constructor(message, statusCode = 500, error = 'APP_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Função para capturar erros assíncronos
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};