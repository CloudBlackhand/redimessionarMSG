import { v4 as uuidv4 } from 'uuid';
import { WahaService } from './wahaService';
import { BotConfig, FormSubmission, WhatsAppMessage, FormField } from '../types';

export class BotService {
  private wahaService: WahaService;
  private configs: Map<string, BotConfig> = new Map();
  private submissions: Map<string, FormSubmission> = new Map();

  constructor() {
    this.wahaService = new WahaService();
    this.initializeDefaultConfig();
  }

  private initializeDefaultConfig(): void {
    const defaultConfig: BotConfig = {
      id: 'default',
      name: 'Bot Padrão',
      greetingMessage: 'Olá! Como posso ajudá-lo hoje?',
      formMessage: 'Por favor, preencha o formulário abaixo:',
      formFields: [
        {
          id: 'name',
          type: 'text',
          label: 'Nome Completo',
          placeholder: 'Digite seu nome completo',
          required: true,
        },
        {
          id: 'email',
          type: 'email',
          label: 'E-mail',
          placeholder: 'Digite seu e-mail',
          required: true,
        },
        {
          id: 'phone',
          type: 'phone',
          label: 'Telefone',
          placeholder: 'Digite seu telefone',
          required: true,
        },
        {
          id: 'message',
          type: 'textarea',
          label: 'Mensagem',
          placeholder: 'Digite sua mensagem',
          required: false,
        },
      ],
      targetGroupId: '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.configs.set('default', defaultConfig);
  }

  async handleMessage(message: WhatsAppMessage): Promise<void> {
    if (message.fromMe) return;

    const config = this.getActiveConfig();
    if (!config) {
      console.log('Nenhuma configuração ativa encontrada');
      return;
    }

    const messageText = message.body.toLowerCase().trim();

    // Verificar se é uma mensagem de saudação
    if (this.isGreetingMessage(messageText)) {
      await this.handleGreeting(message, config);
    } else {
      // QUALQUER OUTRA MENSAGEM: redirecionar diretamente para o grupo
      await this.handleDirectMessage(message, config);
    }
  }

  private isGreetingMessage(text: string): boolean {
    const greetings = [
      'oi', 'olá', 'ola', 'hey', 'hi', 'hello',
      'bom dia', 'boa tarde', 'boa noite',
      'tudo bem', 'como vai', 'e aí'
    ];
    
    return greetings.some(greeting => text.includes(greeting));
  }

  private isFormSubmission(text: string): boolean {
    // Verificar se a mensagem contém dados de formulário
    // Formato: campo: valor
    return text.includes(':') && text.split('\n').length > 1;
  }

  private async handleGreeting(message: WhatsAppMessage, config: BotConfig): Promise<void> {
    try {
      // Iniciar typing
      await this.wahaService.startTyping(message.from);

      // Aguardar um pouco para simular digitação
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Parar typing
      await this.wahaService.stopTyping(message.from);

      // Enviar mensagem de saudação
      await this.wahaService.sendTextMessage(message.from, config.greetingMessage);

      // Aguardar um pouco antes de enviar o formulário
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Enviar formulário
      await this.wahaService.sendFormMessage(message.from, config.formFields);

    } catch (error) {
      console.error('Erro ao processar saudação:', error);
    }
  }

  private async handleFormSubmission(message: WhatsAppMessage, config: BotConfig): Promise<void> {
    try {
      const formData = this.parseFormData(message.body, config.formFields);
      
      if (!formData) {
        await this.wahaService.sendTextMessage(
          message.from,
          'Formato inválido. Por favor, use o formato: Campo: Valor'
        );
        return;
      }

      // Criar submissão
      const submission: FormSubmission = {
        id: uuidv4(),
        configId: config.id,
        from: message.from,
        formData,
        submittedAt: new Date(),
        forwardedToGroup: false,
      };

      this.submissions.set(submission.id, submission);

      // Encaminhar para o grupo se configurado
      if (config.targetGroupId) {
        await this.forwardToGroup(message, config, submission);
      }

      // Confirmar recebimento
      await this.wahaService.sendTextMessage(
        message.from,
        'Obrigado! Sua mensagem foi recebida e encaminhada para nossa equipe.'
      );

    } catch (error) {
      console.error('Erro ao processar submissão do formulário:', error);
      await this.wahaService.sendTextMessage(
        message.from,
        'Ocorreu um erro ao processar sua mensagem. Tente novamente.'
      );
    }
  }

  private async handleDirectMessage(message: WhatsAppMessage, config: BotConfig): Promise<void> {
    try {
      // Criar submissão simples com a mensagem direta
      const submission: FormSubmission = {
        id: uuidv4(),
        configId: config.id,
        from: message.from,
        formData: {
          mensagem: message.body
        },
        submittedAt: new Date(),
        forwardedToGroup: false,
      };

      this.submissions.set(submission.id, submission);

      // Encaminhar para o grupo se configurado
      if (config.targetGroupId) {
        await this.forwardDirectMessageToGroup(message, config, submission);
      }

      // Confirmar recebimento
      await this.wahaService.sendTextMessage(
        message.from,
        'Obrigado! Sua mensagem foi recebida e encaminhada para nossa equipe.'
      );

    } catch (error) {
      console.error('Erro ao processar mensagem direta:', error);
      await this.wahaService.sendTextMessage(
        message.from,
        'Ocorreu um erro ao processar sua mensagem. Tente novamente.'
      );
    }
  }

  private parseFormData(messageBody: string, formFields: FormField[]): Record<string, any> | null {
    try {
      const lines = messageBody.split('\n').filter(line => line.trim());
      const formData: Record<string, any> = {};

      for (const line of lines) {
        if (line.includes(':')) {
          const [fieldName, ...valueParts] = line.split(':');
          const value = valueParts.join(':').trim();
          
          if (fieldName && value) {
            formData[fieldName.trim().toLowerCase()] = value;
          }
        }
      }

      // Verificar se todos os campos obrigatórios estão presentes
      const requiredFields = formFields.filter(field => field.required);
      for (const field of requiredFields) {
        if (!formData[field.id]) {
          return null;
        }
      }

      return formData;
    } catch (error) {
      console.error('Erro ao analisar dados do formulário:', error);
      return null;
    }
  }

  private async forwardToGroup(
    message: WhatsAppMessage,
    config: BotConfig,
    submission: FormSubmission
  ): Promise<void> {
    try {
      // Criar mensagem formatada para o grupo
      const formattedMessage = this.formatMessageForGroup(submission, config);
      
      // Enviar mensagem formatada para o grupo
      const result = await this.wahaService.sendTextMessage(config.targetGroupId, formattedMessage);
      
      if (result.success) {
        submission.forwardedToGroup = true;
        submission.forwardedAt = new Date();
        this.submissions.set(submission.id, submission);
      }
    } catch (error) {
      console.error('Erro ao encaminhar para grupo:', error);
    }
  }

  private async forwardDirectMessageToGroup(
    message: WhatsAppMessage,
    config: BotConfig,
    submission: FormSubmission
  ): Promise<void> {
    try {
      // Criar mensagem formatada para o grupo
      const formattedMessage = this.formatDirectMessageForGroup(submission, config);
      
      // Enviar mensagem formatada para o grupo
      const result = await this.wahaService.sendTextMessage(config.targetGroupId, formattedMessage);
      
      if (result.success) {
        submission.forwardedToGroup = true;
        submission.forwardedAt = new Date();
        this.submissions.set(submission.id, submission);
      }
    } catch (error) {
      console.error('Erro ao encaminhar mensagem direta para grupo:', error);
    }
  }

  private formatDirectMessageForGroup(submission: FormSubmission, config: BotConfig): string {
    const timestamp = submission.submittedAt.toLocaleString('pt-BR');
    const fromNumber = submission.from.replace('@c.us', '');
    
    let message = `📋 *Nova Mensagem Recebida*\n\n`;
    message += `👤 *De:* ${fromNumber}\n`;
    message += `⏰ *Data:* ${timestamp}\n\n`;
    message += `💬 *Mensagem:*\n`;
    message += `${submission.formData.mensagem}`;

    return message;
  }

  private formatMessageForGroup(submission: FormSubmission, config: BotConfig): string {
    const timestamp = submission.submittedAt.toLocaleString('pt-BR');
    const fromNumber = submission.from.replace('@c.us', '');
    
    let message = `📋 *Nova Mensagem Recebida*\n\n`;
    message += `👤 *De:* ${fromNumber}\n`;
    message += `⏰ *Data:* ${timestamp}\n\n`;
    message += `📝 *Dados do Formulário:*\n`;

    for (const [key, value] of Object.entries(submission.formData)) {
      const field = config.formFields.find(f => f.id === key);
      const label = field ? field.label : key;
      message += `• *${label}:* ${value}\n`;
    }

    return message;
  }

  // Métodos de configuração
  getActiveConfig(): BotConfig | null {
    for (const config of this.configs.values()) {
      if (config.isActive) {
        return config;
      }
    }
    return null;
  }

  getAllConfigs(): BotConfig[] {
    return Array.from(this.configs.values());
  }

  getConfig(id: string): BotConfig | null {
    return this.configs.get(id) || null;
  }

  updateConfig(id: string, updates: Partial<BotConfig>): BotConfig | null {
    const config = this.configs.get(id);
    if (!config) return null;

    const updatedConfig: BotConfig = {
      ...config,
      ...updates,
      updatedAt: new Date(),
    };

    this.configs.set(id, updatedConfig);
    return updatedConfig;
  }

  createConfig(configData: Omit<BotConfig, 'id' | 'createdAt' | 'updatedAt'>): BotConfig {
    const newConfig: BotConfig = {
      ...configData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.configs.set(newConfig.id, newConfig);
    return newConfig;
  }

  deleteConfig(id: string): boolean {
    return this.configs.delete(id);
  }

  // Métodos de submissões
  getAllSubmissions(): FormSubmission[] {
    return Array.from(this.submissions.values());
  }

  getSubmission(id: string): FormSubmission | null {
    return this.submissions.get(id) || null;
  }

  getSubmissionsByConfig(configId: string): FormSubmission[] {
    return Array.from(this.submissions.values()).filter(
      submission => submission.configId === configId
    );
  }
}
