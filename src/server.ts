import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { config } from './config';
import apiRoutes from './routes/api';
import webhookRoutes from './routes/webhook';
import { databaseService } from './services/database';
import { cleanupService } from './services/cleanupService';

const app = express();

// Middlewares de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://seu-app.railway.app'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Rotas da API
app.use('/api', apiRoutes);
app.use('/webhook', webhookRoutes);

// Rota para servir o frontend (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

// Middleware de tratamento de erros
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: config.nodeEnv === 'development' ? err.message : 'Algo deu errado'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
});


// Inicializar banco de dados
async function initializeDatabase() {
  try {
    await databaseService.connect();
    console.log('✅ Banco de dados conectado');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
  }
}

// Inicializar serviços
async function initializeServices() {
  try {
    // O cleanupService já é inicializado automaticamente no construtor
    console.log('✅ Serviço de limpeza automática iniciado');
  } catch (error) {
    console.error('Erro ao inicializar serviços:', error);
  }
}

// Inicializar aplicação
async function startServer() {
  await initializeDatabase();
  await initializeServices();
  
  const server = app.listen(config.port, () => {
    console.log('🚀 Servidor rodando na porta', config.port);
    console.log('📱 Ambiente:', config.nodeEnv);
    console.log('🔗 WAHA URL:', config.waha.baseUrl);
    console.log('🤖 Sessão:', config.waha.sessionName);
    console.log('🌐 Frontend:', `http://localhost:${config.port}`);
    console.log('📡 API:', `http://localhost:${config.port}/api`);
    console.log('🔔 Webhook:', `http://localhost:${config.port}/webhook`);
  });

  return server;
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Recebido SIGTERM, encerrando servidor...');
  cleanupService.stop();
  await databaseService.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Recebido SIGINT, encerrando servidor...');
  cleanupService.stop();
  await databaseService.disconnect();
  process.exit(0);
});

// Iniciar servidor se não estiver em modo de teste
if (require.main === module) {
  startServer().catch(console.error);
}

export default app;
