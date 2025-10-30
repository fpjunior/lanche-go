import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Configuração da conexão
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'lanchego',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT) || 5432,
  // Configurações adicionais para produção
  max: 20, // máximo de conexões no pool
  idleTimeoutMillis: 30000, // tempo limite para conexões inativas
  connectionTimeoutMillis: 2000, // tempo limite para obter conexão
};

// Se tiver DATABASE_URL, usar ela (para deploy)
if (process.env.DATABASE_URL) {
  dbConfig.connectionString = process.env.DATABASE_URL;
  if (process.env.NODE_ENV === 'production') {
    dbConfig.ssl = {
      rejectUnauthorized: false
    };
  }
}

// Criar pool de conexões
const pool = new Pool(dbConfig);

// Listener para eventos do pool
pool.on('connect', () => {
  console.log('🔌 Nova conexão estabelecida com PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool de conexões:', err);
  process.exit(-1);
});

// Função para testar conexão
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Conexão com banco de dados estabelecida:', result.rows[0].now);
    return true;
  } catch (err) {
    console.error('❌ Erro ao conectar com o banco de dados:', err);
    return false;
  }
};

// Função para executar queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Query executada:', { text, duration: `${duration}ms`, rows: res.rowCount });
    }
    
    return res;
  } catch (err) {
    console.error('❌ Erro na query:', { text, error: err.message });
    throw err;
  }
};

// Função para executar transações
export const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export default pool;