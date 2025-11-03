import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Configuração da conexão usando DATABASE_URL se disponível
const dbConfig = process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
} : {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'lanchego',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT) || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
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

// Função para testar a conexão e verificar tabelas de auth
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conexão com banco de dados testada com sucesso');
    
    // Verificar se as tabelas de usuários existem
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('usuarios', 'modulos', 'usuario_modulos')
      ORDER BY table_name
    `);
    
    const tabelas = result.rows.map(r => r.table_name);
    console.log(`📊 Tabelas de autenticação encontradas: ${tabelas.join(', ')}`);
    
    if (tabelas.length === 3) {
      console.log('🔐 Sistema de autenticação pronto!');
    } else {
      console.log('⚠️ Algumas tabelas de autenticação estão faltando');
    }
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
    return false;
  }
};

export default pool;