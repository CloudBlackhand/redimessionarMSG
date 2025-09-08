import { databaseService } from '../services/database';
import { BotConfig, FormField } from '../types';

export class BotConfigRepository {
  async getAll(): Promise<BotConfig[]> {
    if (!databaseService.isConnected()) {
      return [];
    }

    const result = await databaseService.query(`
      SELECT 
        id,
        name,
        greeting_message as "greetingMessage",
        form_message as "formMessage",
        form_fields as "formFields",
        target_group_id as "targetGroupId",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM bot_configs 
      ORDER BY created_at DESC
    `);

    return result.rows.map(this.mapRowToConfig);
  }

  async getById(id: string): Promise<BotConfig | null> {
    if (!databaseService.isConnected()) {
      return null;
    }

    const result = await databaseService.query(
      `
      SELECT 
        id,
        name,
        greeting_message as "greetingMessage",
        form_message as "formMessage",
        form_fields as "formFields",
        target_group_id as "targetGroupId",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM bot_configs 
      WHERE id = $1
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToConfig(result.rows[0]);
  }

  async getActive(): Promise<BotConfig | null> {
    if (!databaseService.isConnected()) {
      return null;
    }

    const result = await databaseService.query(`
      SELECT 
        id,
        name,
        greeting_message as "greetingMessage",
        form_message as "formMessage",
        form_fields as "formFields",
        target_group_id as "targetGroupId",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM bot_configs 
      WHERE is_active = true
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToConfig(result.rows[0]);
  }

  async create(config: Omit<BotConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<BotConfig> {
    if (!databaseService.isConnected()) {
      throw new Error('Banco de dados não conectado');
    }

    const id = this.generateId();
    const now = new Date();

    await databaseService.query(
      `
      INSERT INTO bot_configs (
        id, name, greeting_message, form_message, form_fields, 
        target_group_id, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
      [
        id,
        config.name,
        config.greetingMessage,
        config.formMessage,
        JSON.stringify(config.formFields),
        config.targetGroupId,
        config.isActive,
        now,
        now,
      ]
    );

    return {
      ...config,
      id,
      createdAt: now,
      updatedAt: now,
    };
  }

  async update(id: string, updates: Partial<BotConfig>): Promise<BotConfig | null> {
    if (!databaseService.isConnected()) {
      return null;
    }

    const setClause = [];
    const values = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      setClause.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }
    if (updates.greetingMessage !== undefined) {
      setClause.push(`greeting_message = $${paramIndex++}`);
      values.push(updates.greetingMessage);
    }
    if (updates.formMessage !== undefined) {
      setClause.push(`form_message = $${paramIndex++}`);
      values.push(updates.formMessage);
    }
    if (updates.formFields !== undefined) {
      setClause.push(`form_fields = $${paramIndex++}`);
      values.push(JSON.stringify(updates.formFields));
    }
    if (updates.targetGroupId !== undefined) {
      setClause.push(`target_group_id = $${paramIndex++}`);
      values.push(updates.targetGroupId);
    }
    if (updates.isActive !== undefined) {
      setClause.push(`is_active = $${paramIndex++}`);
      values.push(updates.isActive);
    }

    if (setClause.length === 0) {
      return this.getById(id);
    }

    values.push(id);
    setClause.push(`updated_at = NOW()`);

    const result = await databaseService.query(
      `
      UPDATE bot_configs 
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING 
        id, name, greeting_message as "greetingMessage", form_message as "formMessage",
        form_fields as "formFields", target_group_id as "targetGroupId", 
        is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
    `,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToConfig(result.rows[0]);
  }

  async delete(id: string): Promise<boolean> {
    if (!databaseService.isConnected()) {
      return false;
    }

    const result = await databaseService.query('DELETE FROM bot_configs WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  async setActive(id: string): Promise<void> {
    if (!databaseService.isConnected()) {
      return;
    }

    // Desativar todas as configurações
    await databaseService.query('UPDATE bot_configs SET is_active = false');
    
    // Ativar a configuração específica
    await databaseService.query('UPDATE bot_configs SET is_active = true WHERE id = $1', [id]);
  }

  private mapRowToConfig(row: any): BotConfig {
    return {
      id: row.id,
      name: row.name,
      greetingMessage: row.greetingMessage,
      formMessage: row.formMessage,
      formFields: row.formFields || [],
      targetGroupId: row.targetGroupId,
      isActive: row.isActive,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  private generateId(): string {
    return `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const botConfigRepository = new BotConfigRepository();
