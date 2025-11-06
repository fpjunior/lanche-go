import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Configurar variáveis de ambiente
dotenv.config();

// Importar rotas
import menuRoutes from './routes/menuRoutes.js';
import menuItemsRoutes from './routes/menuItems.js';
import pedidosRoutes from './routes/pedidos.js';
import categoriaRoutes from './routes/categoriaRoutes.js';
import authRoutes from './routes/auth.js';
import usuariosRoutes from './routes/usuarios.js';
import imageRoutes from './routes/images.js';

console.log('📦 Módulos de rotas carregados:');
console.log('- menuRoutes:', !!menuRoutes);
console.log('- menuItemsRoutes:', !!menuItemsRoutes);
console.log('- authRoutes:', !!authRoutes);

// Importar configuração do banco
import { testConnection } from './config/database.js';

// Importar middleware de erro
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Middleware de compressão
app.use(compression());

// Middleware de log
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Middleware de CORS
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:4200',
    'http://localhost:4200'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware de parsing condicional
app.use((req, res, next) => {
  const contentType = req.headers['content-type'];
  console.log(`🔍 [MIDDLEWARE] ${req.method} ${req.url} - Content-Type: ${contentType}`);
  
  // Se é multipart/form-data, pula o JSON parser
  if (contentType && contentType.startsWith('multipart/form-data')) {
    console.log(`📦 [MIDDLEWARE] Multipart detectado - pulando JSON parser`);
    return next();
  }
  
  console.log(`📝 [MIDDLEWARE] Aplicando JSON parser`);
  // Senão aplica o JSON parser
  express.json({ limit: '10mb' })(req, res, next);
});

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de debug para todas as requisições
app.use((req, res, next) => {
  console.log(`🔍 Requisição: ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  console.log('🏥 Health check acessado!');
  res.status(200).json({
    status: 'OK',
    message: 'LancheGo API está funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Rotas da API
console.log('🔧 Registrando rotas da API...');
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/menu-items', menuItemsRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/images', imageRoutes);
console.log('✅ Rotas registradas com sucesso!');

// Rota 404 - DEVE SER A ÚLTIMA
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'ERROR',
    message: `Rota ${req.method} ${req.originalUrl} não encontrada`,
    code: 'ROUTE_NOT_FOUND'
  });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Inicializar servidor
const startServer = async () => {
  try {
    // Testar conexão com banco de dados
    await testConnection();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor LancheGo rodando na porta ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`💾 Database: lanchego@db:5432`);
      console.log(`🔐 Sistema de autenticação ativo`);
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
};

startServer();

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

export default app;