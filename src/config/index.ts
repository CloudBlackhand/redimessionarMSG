import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  waha: {
    baseUrl: process.env.WAHA_BASE_URL || 'http://localhost:3001',
    apiKey: process.env.WAHA_API_KEY,
    sessionName: process.env.WHATSAPP_SESSION_NAME || 'bot-session',
  },
  
  bot: {
    greetingMessage: process.env.BOT_GREETING_MESSAGE || 'Olá! Como posso ajudá-lo hoje?',
    formMessage: process.env.BOT_FORM_MESSAGE || 'Por favor, preencha o formulário abaixo:',
  },
  
  security: {
    jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    apiKey: process.env.API_KEY,
  },
  
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
  },
  
  database: {
    url: process.env.DATABASE_URL,
  },
} as const;
