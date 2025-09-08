import { Pool, PoolClient } from 'pg';
import { config } from '../config';

class DatabaseService {
  private pool: Pool | null = null;

  async connect(): Promise<void> {
    if (!config.database.url) {
      console.log('⚠️  DATABASE_URL não configurada - usando armazenamento em memória');
      return;
    }

    try {
      this.pool = new Pool({
        connectionString: config.database.url,
        ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Testar conexão
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      console.log('✅ Conectado ao PostgreSQL');
      await this.initializeTables();
    } catch (error) {
      console.error('❌ Erro ao conectar com PostgreSQL:', error);
      console.log('⚠️  Usando armazenamento em memória');
      this.pool = null;
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      console.log('🔌 Desconectado do PostgreSQL');
    }
  }

  async query(text: string, params?: any[]): Promise<any> {
    if (!this.pool) {
      throw new Error('Banco de dados não conectado');
    }
    return this.pool.query(text, params);
  }

  async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Banco de dados não conectado');
    }
    return this.pool.connect();
  }

  isConnected(): boolean {
    return this.pool !== null;
  }

  private async initializeTables(): Promise<void> {
    if (!this.pool) return;

    const createTables = `
      -- Tabela de configurações do bot
      CREATE TABLE IF NOT EXISTS bot_configs (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        greeting_message TEXT NOT NULL,
        form_message TEXT NOT NULL,
        form_fields JSONB NOT NULL DEFAULT '[]',
        target_group_id VARCHAR(255),
        is_active BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      -- Tabela de submissões
      CREATE TABLE IF NOT EXISTS form_submissions (
        id VARCHAR(255) PRIMARY KEY,
        config_id VARCHAR(255) NOT NULL REFERENCES bot_configs(id) ON DELETE CASCADE,
        from_number VARCHAR(255) NOT NULL,
        form_data JSONB NOT NULL DEFAULT '{}',
        submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        forwarded_to_group BOOLEAN NOT NULL DEFAULT false
      );

      -- Índices para performance
      CREATE INDEX IF NOT EXISTS idx_bot_configs_active ON bot_configs(is_active);
      CREATE INDEX IF NOT EXISTS idx_form_submissions_config_id ON form_submissions(config_id);
      CREATE INDEX IF NOT EXISTS idx_form_submissions_submitted_at ON form_submissions(submitted_at);
      CREATE INDEX IF NOT EXISTS idx_form_submissions_from_number ON form_submissions(from_number);

      -- Trigger para atualizar updated_at
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_bot_configs_updated_at ON bot_configs;
      CREATE TRIGGER update_bot_configs_updated_at
        BEFORE UPDATE ON bot_configs
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;

    await this.query(createTables);
    console.log('📋 Tabelas do banco de dados inicializadas');
  }
}

export const databaseService = new DatabaseService();
