# 📱 WAHA NOWEB API - Documentação Completa

## 🎯 Visão Geral

**WAHA (WhatsApp HTTP API)** é uma API REST completa que permite integrar o WhatsApp em aplicações através de HTTP. Esta documentação cobre especificamente o **engine NOWEB**, que é mais leve, rápido e estável para ambientes de produção.

### 🚀 Características do Engine NOWEB

- ✅ **Sem Browser**: Não precisa de Chrome/Chromium
- ✅ **Mais Rápido**: Inicialização mais rápida
- ✅ **Menos Memória**: Consome menos RAM
- ✅ **Mais Estável**: Menos problemas de browser
- ✅ **Ideal para Railway**: Perfeito para containers

---

## 🔧 Configuração Inicial

### Variáveis de Ambiente

```bash
# Engine
WHATSAPP_DEFAULT_ENGINE=NOWEB

# API Key (opcional, mas recomendado)
WHATSAPP_API_KEY=seu_api_key_aqui

# Porta
PORT=3000

# Configurações do NOWEB
WHATSAPP_WEBJS_HEADLESS=true
WHATSAPP_WEBJS_DEVTOOLS=false

# Sessões (opcional - usar banco para produção)
WHATSAPP_SESSIONS_MONGO_URL=mongodb://user:pass@host:port/db
WHATSAPP_SESSIONS_POSTGRESQL_URL=postgresql://user:pass@host:port/db

# Mídia (opcional - usar S3 para produção)
WAHA_MEDIA_STORAGE=S3
AWS_ACCESS_KEY_ID=seu_access_key
AWS_SECRET_ACCESS_KEY=seu_secret_key
AWS_S3_BUCKET=seu_bucket
AWS_S3_REGION=us-east-1

# Logs
WAHA_DEBUG_MODE=false
NODE_OPTIONS="--max-old-space-size=2048"
```

### Base URL

```
http://seu-app.railway.app
```

---

## 🔑 Autenticação

### API Key (Opcional)

Se configurado, adicione o header:

```http
X-API-Key: seu_api_key_aqui
```

---

## 🖥️ Sessões

### 1. Listar Sessões

```http
GET /api/sessions
```

**Query Parameters:**
- `all` (boolean, opcional): Incluir sessões paradas

**Resposta:**
```json
[
  {
    "name": "default",
    "status": "WORKING",
    "engine": "NOWEB",
    "me": {
      "id": "5511999999999@c.us",
      "name": "Seu Nome"
    }
  }
]
```

### 2. Criar Sessão

```http
POST /api/sessions
```

**Body:**
```json
{
  "name": "minha-sessao",
  "config": {
    "noweb": {
      "store": {
        "enabled": true,
        "fullSync": false
      },
      "markOnline": true
    }
  }
}
```

**Resposta:**
```json
{
  "name": "minha-sessao",
  "status": "STARTING",
  "engine": "NOWEB"
}
```

### 3. Obter Status da Sessão

```http
GET /api/sessions/{sessionName}/status
```

**Resposta:**
```json
{
  "name": "minha-sessao",
  "status": "WORKING",
  "engine": "NOWEB",
  "me": {
    "id": "5511999999999@c.us",
    "name": "Seu Nome"
  }
}
```

**Status Possíveis:**
- `STOPPED` - Parada
- `STARTING` - Iniciando
- `SCAN_QR_CODE` - Aguardando QR
- `WORKING` - Funcionando
- `FAILED` - Falhou

### 4. Parar Sessão

```http
DELETE /api/sessions/{sessionName}
```

### 5. Reiniciar Sessão

```http
POST /api/sessions/{sessionName}/restart
```

---

## 🔐 Autenticação WhatsApp

### 1. Obter QR Code

```http
GET /api/{sessionName}/auth/qr
```

**Query Parameters:**
- `format` (string, opcional): `raw` ou `image` (padrão: `image`)

**Resposta (image):** Buffer da imagem PNG

**Resposta (raw):**
```json
{
  "value": "2@ABC123..."
}
```

### 2. Solicitar Código SMS

```http
POST /api/{sessionName}/auth/request-code
```

**Body:**
```json
{
  "phoneNumber": "5511999999999",
  "method": "SMS"
}
```

**Métodos Disponíveis:**
- `SMS`
- `VOICE`

---

## 📤 Envio de Mensagens

### 1. Enviar Texto

```http
POST /api/sendText
```

**Body:**
```json
{
  "session": "minha-sessao",
  "chatId": "5511999999999@c.us",
  "text": "Olá! Como você está?",
  "reply_to": "false_5511999999999@c.us_ABC123"
}
```

### 2. Enviar Imagem

```http
POST /api/sendImage
```

**Body:**
```json
{
  "session": "minha-sessao",
  "chatId": "5511999999999@c.us",
  "image": {
    "url": "https://example.com/image.jpg"
  },
  "caption": "Legenda da imagem"
}
```

**Alternativa (Base64):**
```json
{
  "session": "minha-sessao",
  "chatId": "5511999999999@c.us",
  "image": {
    "data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
  },
  "caption": "Legenda da imagem"
}
```

### 3. Enviar Arquivo

```http
POST /api/sendFile
```

**Body:**
```json
{
  "session": "minha-sessao",
  "chatId": "5511999999999@c.us",
  "file": {
    "url": "https://example.com/document.pdf"
  },
  "filename": "documento.pdf"
}
```

### 4. Enviar Áudio

```http
POST /api/sendVoice
```

**Body:**
```json
{
  "session": "minha-sessao",
  "chatId": "5511999999999@c.us",
  "audio": {
    "url": "https://example.com/audio.mp3"
  }
}
```

### 5. Enviar Vídeo

```http
POST /api/sendVideo
```

**Body:**
```json
{
  "session": "minha-sessao",
  "chatId": "5511999999999@c.us",
  "video": {
    "url": "https://example.com/video.mp4"
  },
  "caption": "Legenda do vídeo"
}
```

### 6. Enviar Localização

```http
POST /api/sendLocation
```

**Body:**
```json
{
  "session": "minha-sessao",
  "chatId": "5511999999999@c.us",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "address": "São Paulo, SP, Brasil"
}
```

### 7. Enviar Contato

```http
POST /api/sendContact
```

**Body:**
```json
{
  "session": "minha-sessao",
  "chatId": "5511999999999@c.us",
  "contacts": [
    {
      "fullName": "João Silva",
      "phoneNumber": "+5511999999999",
      "organization": "Empresa XYZ"
    }
  ]
}
```

### 8. Enviar Botões

```http
POST /api/sendButtons
```

**Body:**
```json
{
  "session": "minha-sessao",
  "chatId": "5511999999999@c.us",
  "text": "Escolha uma opção:",
  "buttons": [
    {
      "id": "btn1",
      "text": "Opção 1"
    },
    {
      "id": "btn2",
      "text": "Opção 2"
    }
  ]
}
```

### 9. Enviar Lista

```http
POST /api/sendList
```

**Body:**
```json
{
  "session": "minha-sessao",
  "chatId": "5511999999999@c.us",
  "text": "Escolha uma categoria:",
  "buttonText": "Ver Opções",
  "sections": [
    {
      "title": "Categoria 1",
      "rows": [
        {
          "id": "row1",
          "title": "Item 1",
          "description": "Descrição do item 1"
        }
      ]
    }
  ]
}
```

### 10. Enviar Enquete

```http
POST /api/sendPoll
```

**Body:**
```json
{
  "session": "minha-sessao",
  "chatId": "5511999999999@c.us",
  "name": "Qual sua cor favorita?",
  "options": ["Azul", "Verde", "Vermelho"],
  "selectableOptionsCount": 1
}
```

---

## 📥 Recebimento de Mensagens

### 1. Marcar como Lida

```http
POST /api/sendSeen
```

**Body:**
```json
{
  "session": "minha-sessao",
  "chatId": "5511999999999@c.us",
  "messageIds": ["false_5511999999999@c.us_ABC123"],
  "participant": "5511999999999@c.us"
}
```

### 2. Reagir a Mensagem

```http
POST /api/reactMessage
```

**Body:**
```json
{
  "session": "minha-sessao",
  "messageId": "false_5511999999999@c.us_ABC123",
  "reaction": "👍"
}
```

### 3. Favoritar Mensagem

```http
POST /api/starMessage
```

**Body:**
```json
{
  "session": "minha-sessao",
  "messageId": "false_5511999999999@c.us_ABC123"
}
```

### 4. Encaminhar Mensagem

```http
POST /api/forwardMessage
```

**Body:**
```json
{
  "session": "minha-sessao",
  "chatId": "5511888888888@c.us",
  "messageId": "false_5511999999999@c.us_ABC123"
}
```

---

## 💬 Chats e Conversas

### 1. Listar Chats

```http
GET /api/{sessionName}/chats
```

**Query Parameters:**
- `limit` (number, opcional): Limite de resultados (padrão: 50)
- `offset` (number, opcional): Offset para paginação (padrão: 0)

**Resposta:**
```json
[
  {
    "id": "5511999999999@c.us",
    "name": "João Silva",
    "isGroup": false,
    "isReadOnly": false,
    "unreadCount": 2,
    "timestamp": 1692861369,
    "pinned": false,
    "isMuted": false,
    "muteExpiration": null
  }
]
```

### 2. Obter Mensagens do Chat

```http
GET /api/{sessionName}/chats/{chatId}/messages
```

**Query Parameters:**
- `limit` (number, opcional): Limite de mensagens (padrão: 50)
- `offset` (number, opcional): Offset para paginação (padrão: 0)
- `direction` (string, opcional): `before` ou `after` (padrão: `before`)

**Resposta:**
```json
[
  {
    "id": "false_5511999999999@c.us_ABC123",
    "body": "Olá!",
    "type": "chat",
    "timestamp": 1692861369,
    "from": "5511999999999@c.us",
    "fromMe": false,
    "hasQuotedMsg": false,
    "hasReaction": false,
    "ack": 3
  }
]
```

### 3. Marcar Chat como Lido

```http
POST /api/{sessionName}/chats/{chatId}/read
```

**Body:**
```json
{
  "messageIds": ["false_5511999999999@c.us_ABC123"]
}
```

---

## 👥 Contatos

### 1. Listar Contatos

```http
GET /api/{sessionName}/contacts
```

**Query Parameters:**
- `limit` (number, opcional): Limite de resultados (padrão: 50)
- `offset` (number, opcional): Offset para paginação (padrão: 0)

**Resposta:**
```json
[
  {
    "id": "5511999999999@c.us",
    "name": "João Silva",
    "number": "5511999999999",
    "isGroup": false,
    "isUser": true,
    "isWAContact": true,
    "isMyContact": false,
    "isBlocked": false
  }
]
```

### 2. Verificar Status do Número

```http
GET /api/checkNumber
```

**Query Parameters:**
- `session` (string): Nome da sessão
- `phone` (string): Número do telefone

**Resposta:**
```json
{
  "numberExists": true,
  "jid": "5511999999999@c.us"
}
```

### 3. Obter Informações do Contato

```http
GET /api/{sessionName}/contacts/{contactId}
```

**Resposta:**
```json
{
  "id": "5511999999999@c.us",
  "name": "João Silva",
  "number": "5511999999999",
  "isGroup": false,
  "isUser": true,
  "isWAContact": true,
  "isMyContact": false,
  "isBlocked": false
}
```

---

## 👥 Grupos

### 1. Listar Grupos

```http
GET /api/{sessionName}/groups
```

**Resposta:**
```json
[
  {
    "id": "120363123456789012@g.us",
    "name": "Grupo de Trabalho",
    "description": "Grupo para discussões de trabalho",
    "owner": "5511999999999@c.us",
    "creation": 1692861369,
    "participants": [
      {
        "id": "5511999999999@c.us",
        "isAdmin": true,
        "isSuperAdmin": true
      }
    ],
    "participantsCount": 5
  }
]
```

### 2. Criar Grupo

```http
POST /api/{sessionName}/groups
```

**Body:**
```json
{
  "name": "Novo Grupo",
  "participants": ["5511999999999@c.us", "5511888888888@c.us"]
}
```

### 3. Adicionar Participante

```http
POST /api/{sessionName}/groups/{groupId}/participants
```

**Body:**
```json
{
  "participants": ["5511777777777@c.us"]
}
```

### 4. Remover Participante

```http
DELETE /api/{sessionName}/groups/{groupId}/participants/{participantId}
```

### 5. Promover a Admin

```http
POST /api/{sessionName}/groups/{groupId}/admins
```

**Body:**
```json
{
  "participants": ["5511999999999@c.us"]
}
```

### 6. Remover Admin

```http
DELETE /api/{sessionName}/groups/{groupId}/admins/{participantId}
```

### 7. Sair do Grupo

```http
POST /api/{sessionName}/groups/{groupId}/leave
```

---

## ✅ Presença e Status

### 1. Definir Presença

```http
POST /api/{sessionName}/presence
```

**Body:**
```json
{
  "presence": "typing",
  "chatId": "5511999999999@c.us"
}
```

**Status Disponíveis:**
- `online` - Online global
- `offline` - Offline global
- `typing` - Digitando (requer chatId)
- `recording` - Gravando (requer chatId)
- `paused` - Pausado (requer chatId)

### 2. Iniciar Typing

```http
POST /api/startTyping
```

**Body:**
```json
{
  "session": "minha-sessao",
  "chatId": "5511999999999@c.us"
}
```

### 3. Parar Typing

```http
POST /api/stopTyping
```

**Body:**
```json
{
  "session": "minha-sessao",
  "chatId": "5511999999999@c.us"
}
```

### 4. Obter Presença

```http
GET /api/{sessionName}/presence/{chatId}
```

**Resposta:**
```json
{
  "id": "5511999999999@c.us",
  "presences": [
    {
      "participant": "5511999999999@c.us",
      "lastKnownPresence": "typing",
      "lastSeen": 1692861369
    }
  ]
}
```

---

## 🖼️ Mídia

### 1. Upload de Arquivo

```http
POST /api/{sessionName}/media
```

**Body (multipart/form-data):**
- `file`: Arquivo a ser enviado

**Resposta:**
```json
{
  "id": "media_123456",
  "url": "http://seu-app.railway.app/api/files/media_123456"
}
```

### 2. Download de Arquivo

```http
GET /api/{sessionName}/media/{mediaId}
```

**Resposta:** Buffer do arquivo

### 3. Obter Informações da Mídia

```http
GET /api/{sessionName}/media/{mediaId}/info
```

**Resposta:**
```json
{
  "id": "media_123456",
  "filename": "image.jpg",
  "mimetype": "image/jpeg",
  "size": 1024000,
  "url": "http://seu-app.railway.app/api/files/media_123456"
}
```

---

## 🔔 Webhooks

### Configurar Webhook

```http
POST /api/{sessionName}/webhooks
```

**Body:**
```json
{
  "url": "https://seu-app.com/webhook",
  "events": ["message", "message.ack", "session.status"],
  "webhookByEvents": true
}
```

### Eventos Disponíveis

- `message` - Mensagem recebida
- `message.ack` - Confirmação de entrega
- `message.reaction` - Reação a mensagem
- `message.revoked` - Mensagem revogada
- `message.edited` - Mensagem editada
- `session.status` - Mudança de status da sessão
- `group.join` - Entrada em grupo
- `group.leave` - Saída de grupo
- `presence.update` - Atualização de presença
- `call.received` - Chamada recebida
- `call.accepted` - Chamada aceita
- `call.rejected` - Chamada rejeitada

### Exemplo de Payload de Webhook

```json
{
  "event": "message",
  "session": "minha-sessao",
  "payload": {
    "id": "false_5511999999999@c.us_ABC123",
    "body": "Olá!",
    "type": "chat",
    "timestamp": 1692861369,
    "from": "5511999999999@c.us",
    "fromMe": false,
    "hasQuotedMsg": false,
    "hasReaction": false,
    "ack": 3
  }
}
```

---

## 🔍 Observabilidade

### 1. Health Check

```http
GET /health
```

**Resposta:**
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "memory": {
      "status": "up"
    }
  }
}
```

### 2. Ping

```http
GET /ping
```

**Resposta:**
```json
{
  "message": "pong"
}
```

### 3. Versão do Servidor

```http
GET /api/server/version
```

**Resposta:**
```json
{
  "version": "2025.8.3",
  "engine": "NOWEB",
  "tier": "CORE"
}
```

### 4. Status do Servidor

```http
GET /api/server/status
```

**Resposta:**
```json
{
  "status": "ok",
  "uptime": 3600,
  "memory": {
    "used": 100000000,
    "total": 2000000000
  }
}
```

---

## 📊 WebSocket (Tempo Real)

### Conectar ao WebSocket

```javascript
const ws = new WebSocket('ws://seu-app.railway.app/ws?session=minha-sessao&events=message,session.status');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Evento recebido:', data);
};
```

### Eventos WebSocket

- `message` - Mensagem recebida
- `message.ack` - Confirmação de entrega
- `session.status` - Mudança de status
- `presence.update` - Atualização de presença

---

## 🚀 Exemplos Práticos

### 1. Bot Echo Simples

```javascript
// Configurar webhook para receber mensagens
const webhook = {
  url: 'https://seu-bot.com/webhook',
  events: ['message']
};

// Processar mensagem recebida
app.post('/webhook', (req, res) => {
  const { event, payload } = req.body;
  
  if (event === 'message' && !payload.fromMe) {
    // Enviar mensagem de volta
    fetch('http://seu-app.railway.app/api/sendText', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session: 'minha-sessao',
        chatId: payload.from,
        text: `Echo: ${payload.body}`
      })
    });
  }
  
  res.send('OK');
});
```

### 2. Bot com Typing

```javascript
app.post('/webhook', async (req, res) => {
  const { event, payload } = req.body;
  
  if (event === 'message' && !payload.fromMe) {
    // Iniciar typing
    await fetch('http://seu-app.railway.app/api/startTyping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session: 'minha-sessao',
        chatId: payload.from
      })
    });
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Parar typing
    await fetch('http://seu-app.railway.app/api/stopTyping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session: 'minha-sessao',
        chatId: payload.from
      })
    });
    
    // Enviar resposta
    await fetch('http://seu-app.railway.app/api/sendText', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session: 'minha-sessao',
        chatId: payload.from,
        text: 'Processamento concluído!'
      })
    });
  }
  
  res.send('OK');
});
```

### 3. Bot com Botões

```javascript
app.post('/webhook', async (req, res) => {
  const { event, payload } = req.body;
  
  if (event === 'message' && payload.body === '/menu') {
    await fetch('http://seu-app.railway.app/api/sendButtons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session: 'minha-sessao',
        chatId: payload.from,
        text: 'Escolha uma opção:',
        buttons: [
          { id: 'info', text: '📋 Informações' },
          { id: 'help', text: '❓ Ajuda' },
          { id: 'contact', text: '📞 Contato' }
        ]
      })
    });
  }
  
  res.send('OK');
});
```

---

## 🛠️ Troubleshooting

### Problemas Comuns

#### 1. Sessão não conecta
```bash
# Verificar status
curl http://seu-app.railway.app/api/sessions/minha-sessao/status

# Recriar sessão
curl -X DELETE http://seu-app.railway.app/api/sessions/minha-sessao
curl -X POST http://seu-app.railway.app/api/sessions -d '{"name": "minha-sessao"}'
```

#### 2. Erro de memória
```bash
# Aumentar memória
NODE_OPTIONS="--max-old-space-size=4096"
```

#### 3. Timeout de conexão
```bash
# Aumentar timeout
WHATSAPP_NOWEB_TIMEOUT=120000
```

#### 4. Erro de QR Code
```bash
# Verificar QR Code
curl http://seu-app.railway.app/api/screenshot -o qr.png
```

### Logs de Debug

```bash
# Habilitar debug
WAHA_DEBUG_MODE=true

# Ver logs
railway logs
```

---

## 📚 Recursos Adicionais

### Links Úteis

- [Documentação Oficial WAHA](https://waha.devlike.pro/)
- [Swagger UI](http://seu-app.railway.app/) - Documentação interativa
- [Dashboard](http://seu-app.railway.app/dashboard) - Interface web
- [GitHub WAHA](https://github.com/devlikeapro/waha)

### Suporte

- [Issues GitHub](https://github.com/devlikeapro/waha/issues)
- [Discord Community](https://discord.gg/waha)
- [Documentação Completa](https://waha.devlike.pro/docs/)

---

## 🎯 Conclusão

Esta documentação cobre todos os endpoints e funcionalidades do WAHA com engine NOWEB. O sistema é robusto, estável e perfeito para integração em aplicações de produção.

**Principais Vantagens:**
- ✅ API REST completa
- ✅ Engine NOWEB estável
- ✅ Suporte a webhooks
- ✅ WebSocket em tempo real
- ✅ Múltiplos tipos de mídia
- ✅ Sistema de presença
- ✅ Gerenciamento de grupos
- ✅ Pronto para produção

**Próximos Passos:**
1. Configure as variáveis de ambiente
2. Crie uma sessão
3. Autentique com QR Code
4. Configure webhooks
5. Comece a integrar!

🚀 **Boa sorte com sua integração!**
