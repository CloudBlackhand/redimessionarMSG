import { Router, Request, Response } from 'express';
import { BotService } from '../services/botService';
import { WebhookPayload, WhatsAppMessage } from '../types';

const router = Router();
const botService = new BotService();

// Middleware para log de webhooks
const logWebhook = (req: Request, res: Response, next: Function) => {
  console.log(`[WEBHOOK] ${req.method} ${req.path} - ${new Date().toISOString()}`);
  console.log(`[WEBHOOK] Body:`, JSON.stringify(req.body, null, 2));
  next();
};

// Rota principal do webhook
router.post('/', logWebhook, async (req: Request, res: Response) => {
  try {
    const payload: WebhookPayload = req.body;
    
    // Verificar se é um evento de mensagem
    if (payload.event === 'message' && payload.payload) {
      const message: WhatsAppMessage = payload.payload;
      
      // Processar mensagem com o bot
      await botService.handleMessage(message);
    }
    
    // Responder com sucesso
    res.status(200).json({ success: true, message: 'Webhook processado com sucesso' });
    
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Rota para testar o webhook
router.get('/test', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Webhook endpoint funcionando',
    timestamp: new Date().toISOString(),
  });
});

// Rota para configurar webhook no WAHA
router.post('/setup', async (req: Request, res: Response) => {
  try {
    const { wahaBaseUrl, sessionName, webhookUrl } = req.body;
    
    if (!wahaBaseUrl || !sessionName || !webhookUrl) {
      return res.status(400).json({
        success: false,
        error: 'wahaBaseUrl, sessionName e webhookUrl são obrigatórios'
      });
    }

    // Aqui você pode implementar a lógica para configurar o webhook no WAHA
    // Por enquanto, apenas retornamos sucesso
    res.json({
      success: true,
      message: 'Webhook configurado com sucesso',
      data: {
        wahaBaseUrl,
        sessionName,
        webhookUrl,
      }
    });
    
  } catch (error) {
    console.error('Erro ao configurar webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao configurar webhook'
    });
  }
});

export default router;
