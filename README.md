# WhatsApp Bot Config System

Sistema completo de configuração para bot WhatsApp baseado no WAHA NOWEB, com frontend React e backend Node.js/TypeScript.

## 🚀 Funcionalidades

- **Bot WhatsApp Inteligente**: Responde a saudações e coleta dados via formulário
- **Frontend de Configuração**: Interface web para configurar formulários e grupos
- **Integração WAHA NOWEB**: Engine estável e eficiente para WhatsApp
- **Redirecionamento Automático**: Encaminha mensagens para grupos configurados
- **Dashboard Completo**: Monitoramento de submissões e status
- **Deploy no Railway**: Pronto para produção

## 🏗️ Arquitetura

### Backend (Node.js + TypeScript)
- **API REST**: Endpoints para configuração e monitoramento
- **Serviço WAHA**: Integração com WAHA NOWEB
- **Bot Service**: Lógica do bot WhatsApp
- **Webhook Handler**: Processamento de mensagens em tempo real

### Frontend (React + TypeScript)
- **Dashboard**: Visão geral do sistema
- **Configurações**: Gerenciamento de formulários e grupos
- **Submissões**: Visualização de dados coletados
- **Status WAHA**: Monitoramento da conexão

## 📋 Pré-requisitos

- Node.js 18+
- Conta no Railway
- Instância WAHA NOWEB rodando

## 🛠️ Instalação Local

1. **Clone o repositório**
```bash
git clone <seu-repositorio>
cd whatsapp-bot-config
```

2. **Instale as dependências**
```bash
npm run install:all
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Execute o projeto**
```bash
# Desenvolvimento
npm run dev

# Frontend separado
npm run dev:frontend
```

## 🚀 Deploy no Railway

### 1. Preparação

1. **Crie um projeto no Railway**
2. **Conecte seu repositório GitHub**
3. **Configure as variáveis de ambiente**

### 2. Variáveis de Ambiente no Railway

```bash
# Configurações do Servidor
PORT=3000
NODE_ENV=production

# Configurações WAHA
WAHA_BASE_URL=https://sua-instancia-waha.railway.app
WAHA_API_KEY=sua_api_key_waha
WHATSAPP_SESSION_NAME=bot-session

# Configurações do Bot
BOT_GREETING_MESSAGE=Olá! Como posso ajudá-lo hoje?
BOT_FORM_MESSAGE=Por favor, preencha o formulário abaixo:

# Configurações de Segurança
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
API_KEY=sua_api_key_para_protecao

# Configurações de Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### 3. Deploy Automático

O Railway detectará automaticamente:
- **Dockerfile**: Para containerização
- **package.json**: Para build e start
- **railway.json**: Para configurações específicas

## 🔧 Configuração do WAHA

### 1. Instância WAHA NOWEB

```bash
# Docker Compose para WAHA
version: '3.8'
services:
  waha:
    image: devlikeapro/waha:latest
    ports:
      - "3001:3000"
    environment:
      - WHATSAPP_DEFAULT_ENGINE=NOWEB
      - WHATSAPP_API_KEY=sua_api_key_waha
      - WHATSAPP_WEBJS_HEADLESS=true
      - WHATSAPP_WEBJS_DEVTOOLS=false
```

### 2. Configuração de Webhook

Configure o webhook no WAHA para apontar para seu sistema:

```bash
curl -X POST https://sua-instancia-waha.railway.app/api/sessions/bot-session/webhooks \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sua_api_key_waha" \
  -d '{
    "url": "https://seu-sistema.railway.app/webhook",
    "events": ["message", "message.ack", "session.status"],
    "webhookByEvents": true
  }'
```

## 📱 Como Usar

### 1. Configuração Inicial

1. **Acesse o frontend**: `https://seu-sistema.railway.app`
2. **Faça login** com sua API Key
3. **Configure o WAHA** na aba "Status WAHA"
4. **Crie uma configuração** na aba "Configurações"

### 2. Configuração do Bot

1. **Nome**: Identificação da configuração
2. **Mensagem de Saudação**: Resposta a "oi", "olá", etc.
3. **Mensagem do Formulário**: Texto antes dos campos
4. **Campos do Formulário**: Adicione campos personalizados
5. **Grupo de Destino**: Selecione o grupo para redirecionamento

### 3. Funcionamento

1. **Usuário envia saudação** → Bot responde com formulário
2. **Usuário preenche formulário** → Bot processa dados
3. **Dados são encaminhados** → Para o grupo configurado
4. **Confirmação enviada** → Para o usuário

## 🔍 Monitoramento

### Dashboard
- Status da sessão WAHA
- Número de configurações ativas
- Total de submissões
- Submissões do dia

### Logs
```bash
# Railway CLI
railway logs

# Docker
docker logs <container_id>
```

## 🛡️ Segurança

- **API Key**: Proteção de endpoints
- **CORS**: Configurado para produção
- **Helmet**: Headers de segurança
- **Validação**: Joi para validação de dados

## 📊 Estrutura de Dados

### Configuração do Bot
```typescript
interface BotConfig {
  id: string;
  name: string;
  greetingMessage: string;
  formMessage: string;
  formFields: FormField[];
  targetGroupId: string;
  targetGroupName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Submissão de Formulário
```typescript
interface FormSubmission {
  id: string;
  configId: string;
  from: string;
  fromName?: string;
  formData: Record<string, any>;
  submittedAt: Date;
  forwardedToGroup: boolean;
  forwardedAt?: Date;
}
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Sessão WAHA não conecta**
   - Verifique se o WAHA está rodando
   - Confirme as variáveis de ambiente
   - Verifique os logs do WAHA

2. **Webhook não funciona**
   - Confirme a URL do webhook
   - Verifique se o sistema está acessível
   - Teste o endpoint `/webhook/test`

3. **Frontend não carrega**
   - Verifique se o build foi executado
   - Confirme as configurações de CORS
   - Verifique os logs do servidor

### Logs Úteis

```bash
# Status da sessão
curl https://seu-sistema.railway.app/api/waha/status

# Health check
curl https://seu-sistema.railway.app/api/health

# Teste do webhook
curl https://seu-sistema.railway.app/webhook/test
```

## 📈 Próximos Passos

- [ ] Integração com banco de dados
- [ ] Sistema de usuários
- [ ] Relatórios avançados
- [ ] Múltiplas sessões WhatsApp
- [ ] Integração com CRM
- [ ] Analytics de conversas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/whatsapp-bot-config/issues)
- **Documentação**: [Wiki do Projeto](https://github.com/seu-usuario/whatsapp-bot-config/wiki)
- **Email**: seu-email@exemplo.com

---

**Desenvolvido com ❤️ para automatizar conversas WhatsApp de forma inteligente e eficiente.**
