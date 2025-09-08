import axios from 'axios';
import { BotConfig, WahaSession, Chat, Group, FormSubmission, ApiResponse } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar API key se disponível
api.interceptors.request.use((config) => {
  // Em modo desenvolvimento, usa a API key do .env
  const apiKey = localStorage.getItem('apiKey') || 'test-api-key-123';
  if (apiKey) {
    config.headers['X-API-Key'] = apiKey;
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Erro de autenticação:', error);
      // Em modo desenvolvimento, não redireciona para login
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Configurações do Bot
  getConfigs: async (): Promise<BotConfig[]> => {
    const response = await api.get<ApiResponse<BotConfig[]>>('/configs');
    return response.data.data || [];
  },

  getConfig: async (id: string): Promise<BotConfig> => {
    const response = await api.get<ApiResponse<BotConfig>>(`/configs/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Configuração não encontrada');
    }
    return response.data.data;
  },

  createConfig: async (config: Omit<BotConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<BotConfig> => {
    const response = await api.post<ApiResponse<BotConfig>>('/configs', config);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Erro ao criar configuração');
    }
    return response.data.data;
  },

  updateConfig: async (id: string, config: Partial<BotConfig>): Promise<BotConfig> => {
    const response = await api.put<ApiResponse<BotConfig>>(`/configs/${id}`, config);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Erro ao atualizar configuração');
    }
    return response.data.data;
  },

  deleteConfig: async (id: string): Promise<void> => {
    const response = await api.delete<ApiResponse>(`/configs/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao excluir configuração');
    }
  },

  // Submissões
  getSubmissions: async (): Promise<FormSubmission[]> => {
    const response = await api.get<ApiResponse<FormSubmission[]>>('/submissions');
    return response.data.data || [];
  },

  getSubmission: async (id: string): Promise<FormSubmission> => {
    const response = await api.get<ApiResponse<FormSubmission>>(`/submissions/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Submissão não encontrada');
    }
    return response.data.data;
  },

  // WAHA
  getWahaStatus: async (): Promise<WahaSession> => {
    const response = await api.get<ApiResponse<WahaSession>>('/waha/status');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Erro ao obter status do WAHA');
    }
    return response.data.data;
  },

  createWahaSession: async (): Promise<WahaSession> => {
    const response = await api.post<ApiResponse<WahaSession>>('/waha/session');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Erro ao criar sessão WAHA');
    }
    return response.data.data;
  },

  getQrCode: async (): Promise<string> => {
    const response = await api.get<ApiResponse<{ qrCode: string }>>('/waha/qr');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Erro ao obter QR Code');
    }
    return response.data.data.qrCode;
  },

  getChats: async (): Promise<Chat[]> => {
    const response = await api.get<ApiResponse<Chat[]>>('/waha/chats');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Erro ao obter chats');
    }
    return response.data.data;
  },

  getGroups: async (): Promise<Group[]> => {
    const response = await api.get<ApiResponse<Group[]>>('/waha/groups');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Erro ao obter grupos');
    }
    return response.data.data;
  },

  // Health check
  healthCheck: async (): Promise<{ timestamp: string; uptime: number }> => {
    const response = await api.get<ApiResponse<{ timestamp: string; uptime: number }>>('/health');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Erro no health check');
    }
    return response.data.data;
  },
};

export default api;
