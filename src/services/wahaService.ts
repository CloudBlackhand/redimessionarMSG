import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { WahaSession, WhatsAppMessage, ApiResponse } from '../types';

export class WahaService {
  private client: AxiosInstance;
  private sessionName: string;

  constructor() {
    this.sessionName = config.waha.sessionName;
    this.client = axios.create({
      baseURL: config.waha.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.waha.apiKey && { 'X-API-Key': config.waha.apiKey }),
      },
    });
  }

  async getSessionStatus(): Promise<WahaSession> {
    try {
      const response = await this.client.get(`/api/sessions/${this.sessionName}/status`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter status da sessão:', error);
      throw new Error('Falha ao conectar com WAHA');
    }
  }

  async createSession(): Promise<WahaSession> {
    try {
      const response = await this.client.post('/api/sessions', {
        name: this.sessionName,
        config: {
          noweb: {
            store: {
              enabled: true,
              fullSync: false,
            },
            markOnline: true,
          },
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      throw new Error('Falha ao criar sessão WAHA');
    }
  }

  async getQrCode(): Promise<string> {
    try {
      const response = await this.client.get(`/api/${this.sessionName}/auth/qr?format=raw`);
      return response.data.value;
    } catch (error) {
      console.error('Erro ao obter QR Code:', error);
      throw new Error('Falha ao obter QR Code');
    }
  }

  async sendTextMessage(chatId: string, text: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/sendText', {
        session: this.sessionName,
        chatId,
        text,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return { success: false, error: 'Falha ao enviar mensagem' };
    }
  }

  async sendButtons(chatId: string, text: string, buttons: Array<{ id: string; text: string }>): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/sendButtons', {
        session: this.sessionName,
        chatId,
        text,
        buttons,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao enviar botões:', error);
      return { success: false, error: 'Falha ao enviar botões' };
    }
  }

  async sendFormMessage(chatId: string, formFields: any[]): Promise<ApiResponse> {
    try {
      // Criar botões para cada campo do formulário
      const buttons = formFields.map((field, index) => ({
        id: `field_${field.id}`,
        text: `${index + 1}. ${field.label}`,
      }));

      const formText = `${config.bot.formMessage}\n\n${formFields.map((field, index) => 
        `${index + 1}. ${field.label}${field.required ? ' *' : ''}`
      ).join('\n')}`;

      return await this.sendButtons(chatId, formText, buttons);
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      return { success: false, error: 'Falha ao enviar formulário' };
    }
  }

  async forwardMessage(targetChatId: string, messageId: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/forwardMessage', {
        session: this.sessionName,
        chatId: targetChatId,
        messageId,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao encaminhar mensagem:', error);
      return { success: false, error: 'Falha ao encaminhar mensagem' };
    }
  }

  async startTyping(chatId: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/startTyping', {
        session: this.sessionName,
        chatId,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao iniciar typing:', error);
      return { success: false, error: 'Falha ao iniciar typing' };
    }
  }

  async stopTyping(chatId: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post('/api/stopTyping', {
        session: this.sessionName,
        chatId,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao parar typing:', error);
      return { success: false, error: 'Falha ao parar typing' };
    }
  }

  async checkNumber(phone: string): Promise<ApiResponse> {
    try {
      const response = await this.client.get('/api/checkNumber', {
        params: {
          session: this.sessionName,
          phone,
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao verificar número:', error);
      return { success: false, error: 'Falha ao verificar número' };
    }
  }

  async getChats(): Promise<ApiResponse> {
    try {
      const response = await this.client.get(`/api/${this.sessionName}/chats`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao obter chats:', error);
      return { success: false, error: 'Falha ao obter chats' };
    }
  }

  async getGroups(): Promise<ApiResponse> {
    try {
      const response = await this.client.get(`/api/${this.sessionName}/groups`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao obter grupos:', error);
      return { success: false, error: 'Falha ao obter grupos' };
    }
  }

  async configureWebhook(webhookUrl: string): Promise<ApiResponse> {
    try {
      const response = await this.client.post(`/api/${this.sessionName}/webhooks`, {
        url: webhookUrl,
        events: ['message', 'message.ack', 'session.status'],
        webhookByEvents: true
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao configurar webhook:', error);
      return { success: false, error: 'Falha ao configurar webhook' };
    }
  }

  async getSessions(): Promise<ApiResponse> {
    try {
      const response = await this.client.get('/api/sessions');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao obter sessões:', error);
      return { success: false, error: 'Falha ao obter sessões' };
    }
  }

  async deleteSession(): Promise<ApiResponse> {
    try {
      const response = await this.client.delete(`/api/sessions/${this.sessionName}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao deletar sessão:', error);
      return { success: false, error: 'Falha ao deletar sessão' };
    }
  }

  async restartSession(): Promise<ApiResponse> {
    try {
      const response = await this.client.post(`/api/sessions/${this.sessionName}/restart`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao reiniciar sessão:', error);
      return { success: false, error: 'Falha ao reiniciar sessão' };
    }
  }
}
