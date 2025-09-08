import { botConfigRepository } from '../repositories/botConfigRepository';
import { submissionRepository } from '../repositories/submissionRepository';
import { databaseService } from './database';

export class CleanupService {
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly CLEANUP_INTERVAL_DAYS = 15; // 15 dias
  private readonly CLEANUP_INTERVAL_MS = this.CLEANUP_INTERVAL_DAYS * 24 * 60 * 60 * 1000; // 15 dias em ms

  constructor() {
    this.startCleanupScheduler();
  }

  /**
   * Inicia o agendador de limpeza automática
   */
  private startCleanupScheduler(): void {
    console.log(`🧹 Serviço de limpeza iniciado - Limpeza a cada ${this.CLEANUP_INTERVAL_DAYS} dias`);
    
    // Executa a limpeza imediatamente na inicialização (opcional)
    // this.performCleanup();

    // Agenda a limpeza periódica
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, this.CLEANUP_INTERVAL_MS);

    console.log(`⏰ Próxima limpeza agendada para: ${new Date(Date.now() + this.CLEANUP_INTERVAL_MS).toLocaleString('pt-BR')}`);
  }

  /**
   * Executa a limpeza completa do banco de dados
   */
  public async performCleanup(): Promise<void> {
    try {
      console.log('🧹 Iniciando limpeza automática do banco de dados...');
      
      const startTime = Date.now();
      
      // Limpa todas as submissões
      await this.cleanupSubmissions();
      
      // Limpa todas as configurações (opcional - você pode querer manter as configs)
      // await this.cleanupConfigurations();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`✅ Limpeza concluída em ${duration}ms`);
      console.log(`⏰ Próxima limpeza: ${new Date(Date.now() + this.CLEANUP_INTERVAL_MS).toLocaleString('pt-BR')}`);
      
    } catch (error) {
      console.error('❌ Erro durante a limpeza automática:', error);
    }
  }

  /**
   * Limpa todas as submissões do banco
   */
  private async cleanupSubmissions(): Promise<void> {
    try {
      const result = await submissionRepository.deleteAll();
      console.log(`🗑️ Submissões removidas: ${result.count || 'N/A'}`);
    } catch (error) {
      console.error('❌ Erro ao limpar submissões:', error);
      throw error;
    }
  }

  /**
   * Limpa todas as configurações do banco (opcional)
   */
  private async cleanupConfigurations(): Promise<void> {
    try {
      const result = await botConfigRepository.deleteAll();
      console.log(`🗑️ Configurações removidas: ${result.count || 'N/A'}`);
    } catch (error) {
      console.error('❌ Erro ao limpar configurações:', error);
      throw error;
    }
  }

  /**
   * Limpeza manual via API (para testes)
   */
  public async manualCleanup(): Promise<{ success: boolean; message: string; cleanedAt: string }> {
    try {
      await this.performCleanup();
      return {
        success: true,
        message: 'Limpeza manual executada com sucesso',
        cleanedAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro na limpeza manual: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        cleanedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Para o serviço de limpeza
   */
  public stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('🛑 Serviço de limpeza parado');
    }
  }

  /**
   * Obtém informações sobre o próximo agendamento
   */
  public getNextCleanupInfo(): { nextCleanup: string; intervalDays: number } {
    return {
      nextCleanup: new Date(Date.now() + this.CLEANUP_INTERVAL_MS).toLocaleString('pt-BR'),
      intervalDays: this.CLEANUP_INTERVAL_DAYS
    };
  }
}

// Instância singleton
export const cleanupService = new CleanupService();
