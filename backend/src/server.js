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
import pedidoRoutes from './routes/pedidoRoutes.js';
import categoriaRoutes from './routes/categoriaRoutes.js';

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

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'LancheGo API está funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Rotas da API
app.use('/api/menu', menuRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/categorias', categoriaRoutes);

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Rota ${req.method} ${req.originalUrl} não encontrada`
  });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Inicializar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor LancheGo rodando na porta ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`💾 Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
});

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