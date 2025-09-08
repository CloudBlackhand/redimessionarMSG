import { databaseService } from '../services/database';
import { FormSubmission } from '../types';

export class SubmissionRepository {
  async getAll(): Promise<FormSubmission[]> {
    if (!databaseService.isConnected()) {
      return [];
    }

    const result = await databaseService.query(`
      SELECT 
        id,
        config_id as "configId",
        from_number as "from",
        form_data as "formData",
        submitted_at as "submittedAt",
        forwarded_to_group as "forwardedToGroup"
      FROM form_submissions 
      ORDER BY submitted_at DESC
    `);

    return result.rows.map(this.mapRowToSubmission);
  }

  async getById(id: string): Promise<FormSubmission | null> {
    if (!databaseService.isConnected()) {
      return null;
    }

    const result = await databaseService.query(
      `
      SELECT 
        id,
        config_id as "configId",
        from_number as "from",
        form_data as "formData",
        submitted_at as "submittedAt",
        forwarded_to_group as "forwardedToGroup"
      FROM form_submissions 
      WHERE id = $1
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToSubmission(result.rows[0]);
  }

  async getByConfigId(configId: string): Promise<FormSubmission[]> {
    if (!databaseService.isConnected()) {
      return [];
    }

    const result = await databaseService.query(
      `
      SELECT 
        id,
        config_id as "configId",
        from_number as "from",
        form_data as "formData",
        submitted_at as "submittedAt",
        forwarded_to_group as "forwardedToGroup"
      FROM form_submissions 
      WHERE config_id = $1
      ORDER BY submitted_at DESC
    `,
      [configId]
    );

    return result.rows.map(this.mapRowToSubmission);
  }

  async getByFromNumber(fromNumber: string): Promise<FormSubmission[]> {
    if (!databaseService.isConnected()) {
      return [];
    }

    const result = await databaseService.query(
      `
      SELECT 
        id,
        config_id as "configId",
        from_number as "from",
        form_data as "formData",
        submitted_at as "submittedAt",
        forwarded_to_group as "forwardedToGroup"
      FROM form_submissions 
      WHERE from_number = $1
      ORDER BY submitted_at DESC
    `,
      [fromNumber]
    );

    return result.rows.map(this.mapRowToSubmission);
  }

  async create(submission: Omit<FormSubmission, 'id'>): Promise<FormSubmission> {
    if (!databaseService.isConnected()) {
      throw new Error('Banco de dados não conectado');
    }

    const id = this.generateId();

    await databaseService.query(
      `
      INSERT INTO form_submissions (
        id, config_id, from_number, form_data, submitted_at, forwarded_to_group
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `,
      [
        id,
        submission.configId,
        submission.from,
        JSON.stringify(submission.formData),
        submission.submittedAt,
        submission.forwardedToGroup,
      ]
    );

    return {
      ...submission,
      id,
    };
  }

  async update(id: string, updates: Partial<FormSubmission>): Promise<FormSubmission | null> {
    if (!databaseService.isConnected()) {
      return null;
    }

    const setClause = [];
    const values = [];
    let paramIndex = 1;

    if (updates.formData !== undefined) {
      setClause.push(`form_data = $${paramIndex++}`);
      values.push(JSON.stringify(updates.formData));
    }
    if (updates.forwardedToGroup !== undefined) {
      setClause.push(`forwarded_to_group = $${paramIndex++}`);
      values.push(updates.forwardedToGroup);
    }

    if (setClause.length === 0) {
      return this.getById(id);
    }

    values.push(id);

    const result = await databaseService.query(
      `
      UPDATE form_submissions 
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING 
        id, config_id as "configId", from_number as "from", 
        form_data as "formData", submitted_at as "submittedAt", 
        forwarded_to_group as "forwardedToGroup"
    `,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToSubmission(result.rows[0]);
  }

  async delete(id: string): Promise<boolean> {
    if (!databaseService.isConnected()) {
      return false;
    }

    const result = await databaseService.query('DELETE FROM form_submissions WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  async getStats(): Promise<{
    totalSubmissions: number;
    submissionsByConfig: Array<{ configId: string; count: number }>;
    submissionsToday: number;
    submissionsThisWeek: number;
  }> {
    if (!databaseService.isConnected()) {
      return {
        totalSubmissions: 0,
        submissionsByConfig: [],
        submissionsToday: 0,
        submissionsThisWeek: 0,
      };
    }

    const [totalResult, configResult, todayResult, weekResult] = await Promise.all([
      databaseService.query('SELECT COUNT(*) as count FROM form_submissions'),
      databaseService.query(`
        SELECT config_id, COUNT(*) as count 
        FROM form_submissions 
        GROUP BY config_id
      `),
      databaseService.query(`
        SELECT COUNT(*) as count 
        FROM form_submissions 
        WHERE submitted_at >= CURRENT_DATE
      `),
      databaseService.query(`
        SELECT COUNT(*) as count 
        FROM form_submissions 
        WHERE submitted_at >= CURRENT_DATE - INTERVAL '7 days'
      `),
    ]);

    return {
      totalSubmissions: parseInt(totalResult.rows[0].count),
      submissionsByConfig: configResult.rows.map((row: any) => ({
        configId: row.config_id,
        count: parseInt(row.count),
      })),
      submissionsToday: parseInt(todayResult.rows[0].count),
      submissionsThisWeek: parseInt(weekResult.rows[0].count),
    };
  }

  private mapRowToSubmission(row: any): FormSubmission {
    return {
      id: row.id,
      configId: row.configId,
      from: row.from,
      formData: row.formData || {},
      submittedAt: new Date(row.submittedAt),
      forwardedToGroup: row.forwardedToGroup,
    };
  }

  private generateId(): string {
    return `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const submissionRepository = new SubmissionRepository();
