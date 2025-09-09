import { Router, Request, Response } from 'express';
import { BotService } from '../services/botService';
import { WahaService } from '../services/wahaService';
import { BotConfig, FormField, ApiResponse } from '../types';
import Joi from 'joi';

const router = Router();
const botService = new BotService();
const wahaService = new WahaService();

// Middleware de autenticação simples
const authenticateApiKey = (req: Request, res: Response, next: Function) => {
  const apiKey = req.headers['x-api-key'] as string;
  const expectedApiKey = process.env.API_KEY;
  
  if (expectedApiKey && apiKey !== expectedApiKey) {
    return res.status(401).json({ success: false, error: 'API Key inválida' });
  }
  
  return next();
};

// Schemas de validação
const formFieldSchema = Joi.object({
  id: Joi.string().required(),
  type: Joi.string().valid('text', 'email', 'phone', 'number', 'select', 'textarea').required(),
  label: Joi.string().required(),
  placeholder: Joi.string().optional(),
  required: Joi.boolean().required(),
  options: Joi.array().items(Joi.string()).optional(),
  validation: Joi.object({
    min: Joi.number().optional(),
    max: Joi.number().optional(),
    pattern: Joi.string().optional(),
  }).optional(),
});

const botConfigSchema = Joi.object({
  name: Joi.string().required(),
  greetingMessage: Joi.string().required(),
  formMessage: Joi.string().required(),
  formFields: Joi.array().items(formFieldSchema).required(),
  targetGroupId: Joi.string().optional(),
  targetGroupName: Joi.string().optional(),
  isActive: Joi.boolean().required(),
});

// Rotas de configuração do bot
router.get('/configs', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const configs = await botService.getAllConfigs();
    const response: ApiResponse<BotConfig[]> = {
      success: true,
      data: configs,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao obter configurações',
    };
    res.status(500).json(response);
  }
});

router.get('/configs/:id', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: 'ID é obrigatório',
      };
      return res.status(400).json(response);
    }
    
    const config = await botService.getConfig(id);
    
    if (!config) {
      const response: ApiResponse = {
        success: false,
        error: 'Configuração não encontrada',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<BotConfig> = {
      success: true,
      data: config,
    };
    return res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao obter configuração',
    };
    return res.status(500).json(response);
  }
});

router.post('/configs', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const { error, value } = botConfigSchema.validate(req.body);
    
    if (error) {
      const response: ApiResponse = {
        success: false,
        error: error.details[0]?.message || 'Erro de validação',
      };
      return res.status(400).json(response);
    }

    const config = await botService.createConfig(value);
    const response: ApiResponse<BotConfig> = {
      success: true,
      data: config,
      message: 'Configuração criada com sucesso',
    };
    return res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao criar configuração',
    };
    return res.status(500).json(response);
  }
});

router.put('/configs/:id', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: 'ID é obrigatório',
      };
      return res.status(400).json(response);
    }
    
    const { error, value } = botConfigSchema.validate(req.body);
    
    if (error) {
      const response: ApiResponse = {
        success: false,
        error: error.details[0]?.message || 'Erro de validação',
      };
      return res.status(400).json(response);
    }

    const config = await botService.updateConfig(id, value);
    
    if (!config) {
      const response: ApiResponse = {
        success: false,
        error: 'Configuração não encontrada',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<BotConfig> = {
      success: true,
      data: config,
      message: 'Configuração atualizada com sucesso',
    };
    return res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao atualizar configuração',
    };
    return res.status(500).json(response);
  }
});

router.delete('/configs/:id', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: 'ID é obrigatório',
      };
      return res.status(400).json(response);
    }
    
    const deleted = await botService.deleteConfig(id);
    
    if (!deleted) {
      const response: ApiResponse = {
        success: false,
        error: 'Configuração não encontrada',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Configuração excluída com sucesso',
    };
    return res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao excluir configuração',
    };
    return res.status(500).json(response);
  }
});

// Rota de estatísticas/métricas
router.get('/stats', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const configs = await botService.getAllConfigs();
    const submissions = await botService.getAllSubmissions();
    
    const activeConfigs = configs.filter(config => config.isActive).length;
    const totalSubmissions = submissions.length;
    
    // Calcular submissões de hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const submissionsToday = submissions.filter(submission => 
      new Date(submission.submittedAt) >= today
    ).length;
    
    const stats = {
      activeConfigs,
      totalSubmissions,
      submissionsToday,
      totalConfigs: configs.length
    };
    
    const response: ApiResponse = {
      success: true,
      data: stats,
    };
    res.json(response);
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao obter estatísticas',
    };
    res.status(500).json(response);
  }
});

// Rotas de submissões
router.get('/submissions', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const submissions = await botService.getAllSubmissions();
    const response: ApiResponse = {
      success: true,
      data: submissions,
    };
    res.json(response);
  } catch (error) {
    console.error('Erro ao obter submissões:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao obter submissões',
    };
    res.status(500).json(response);
  }
});

router.get('/submissions/:id', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: 'ID é obrigatório',
      };
      return res.status(400).json(response);
    }
    
    const submission = await botService.getSubmission(id);
    
    if (!submission) {
      const response: ApiResponse = {
        success: false,
        error: 'Submissão não encontrada',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: submission,
    };
    return res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao obter submissão',
    };
    return res.status(500).json(response);
  }
});

// Rotas do WAHA
router.get('/waha/status', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const status = await wahaService.getSessionStatus();
    const response: ApiResponse = {
      success: true,
      data: status,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao obter status do WAHA',
    };
    res.status(500).json(response);
  }
});

router.post('/waha/session', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const session = await wahaService.createSession();
    const response: ApiResponse = {
      success: true,
      data: session,
      message: 'Sessão criada com sucesso',
    };
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao criar sessão WAHA',
    };
    res.status(500).json(response);
  }
});

router.post('/waha/start', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const result = await wahaService.startSession();
    const response: ApiResponse = {
      success: result.success,
      data: result.data,
      message: result.success ? 'Sessão iniciada com sucesso' : 'Erro ao iniciar sessão',
    };
    res.status(result.success ? 200 : 500).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao iniciar sessão WAHA',
    };
    res.status(500).json(response);
  }
});

router.get('/waha/qr', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const qrCode = await wahaService.getQrCode();
    const response: ApiResponse = {
      success: true,
      data: { qrCode },
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao obter QR Code',
    };
    res.status(500).json(response);
  }
});

router.get('/waha/chats', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const result = await wahaService.getChats();
    res.json(result);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao obter chats',
    };
    res.status(500).json(response);
  }
});

router.get('/waha/groups', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const result = await wahaService.getGroups();
    res.json(result);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao obter grupos',
    };
    res.status(500).json(response);
  }
});

router.get('/waha/sessions', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const result = await wahaService.getSessions();
    res.json(result);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao obter sessões',
    };
    res.status(500).json(response);
  }
});

router.delete('/waha/session', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const result = await wahaService.deleteSession();
    res.json(result);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao deletar sessão',
    };
    res.status(500).json(response);
  }
});

router.post('/waha/session/restart', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const result = await wahaService.restartSession();
    res.json(result);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao reiniciar sessão',
    };
    res.status(500).json(response);
  }
});

router.post('/waha/webhook', authenticateApiKey, async (req: Request, res: Response) => {
  try {
    const { webhookUrl } = req.body;
    if (!webhookUrl) {
      return res.status(400).json({
        success: false,
        error: 'webhookUrl é obrigatório'
      });
    }
    
    const result = await wahaService.configureWebhook(webhookUrl);
    return res.json(result);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Erro ao configurar webhook',
    };
    return res.status(500).json(response);
  }
});

// Rota de teste
router.get('/health', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    message: 'Sistema funcionando corretamente',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  };
  res.json(response);
});

export default router;
