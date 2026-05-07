# whatsapp-personal-helper

API Node.js pessoal que conecta ao WhatsApp via `whatsapp-web.js` e expõe endpoints para disparar ações — inicialmente envio de mensagens, com suporte futuro a integrações com IA (Claude).

---

## Visão Geral

```
Cliente / Trigger externo
        │
        ▼
  REST API (Express)
        │
   ┌────┴────────────────┐
   │  Action Handlers    │   ← um handler por "ação"
   └────┬────────────────┘
        │
  WhatsApp Client       (Claude / IA)   ← plug futuro
  (whatsapp-web.js)
```

O fluxo básico:
1. Um trigger externo (cron, webhook, n8n, etc.) chama um endpoint da API.
2. O endpoint delega para um **Action Handler** especializado.
3. O handler usa o cliente WhatsApp para executar a ação (enviar mensagem, etc.).
4. Futuramente, um handler pode chamar Claude antes de agir — sem mudar a estrutura.

---

## Estrutura de Diretórios

```
whatsapp-personal-helper/
├── src/
│   ├── server.ts              # Bootstrap do Express
│   ├── whatsapp/
│   │   └── client.ts          # Singleton do whatsapp-web.js
│   ├── actions/               # ← um arquivo por ação
│   │   └── sendGroupMessage.ts
│   ├── routes/
│   │   └── index.ts           # Registra todas as rotas
│   └── ai/                    # ← pasta reservada para Claude (vazia por ora)
│       └── .gitkeep
├── .env
├── package.json
└── tsconfig.json
```

**Regra de crescimento:** cada nova ação = novo arquivo em `src/actions/` + nova rota em `src/routes/index.ts`. Sem mexer no restante.

---

## Endpoints

### `POST /actions/send-group-message`

Envia uma mensagem de texto em um grupo do WhatsApp.

**Body:**
```json
{
  "groupId": "XXXXXXXXXX@g.us",
  "message": "Texto da mensagem"
}
```

**Response 200:**
```json
{ "ok": true }
```

---

## Como plugar Claude no futuro

Cada Action Handler recebe um contexto e retorna um resultado. Para adicionar IA:

1. Criar `src/ai/claude.ts` com um cliente Anthropic configurado.
2. No handler desejado, chamar Claude antes de montar a mensagem:

```ts
// Exemplo futuro em sendGroupMessage.ts
import { askClaude } from '../ai/claude'

const message = await askClaude(rawInput)
await whatsappClient.sendMessage(groupId, message)
```

Nenhuma outra camada precisa mudar.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 20 / TypeScript 5 |
| HTTP | Express |
| WhatsApp | whatsapp-web.js + Puppeteer (Chromium) |
| Container | Docker + Docker Compose |
| IA (futuro) | Anthropic SDK (`@anthropic-ai/sdk`) |
| Auth da API | Bearer token via `Authorization` header |

---

## Variáveis de Ambiente (`.env`)

```env
PORT=3000
API_SECRET=seu-token-aqui
```

---

## Como rodar

### Desenvolvimento (hot-reload)

O `docker-compose.override.yml` está incluso e ativa automaticamente hot-reload com bind mount do `src/`:

```bash
cp .env.example .env
# edite .env com seu API_SECRET
docker compose up --build
```

Na primeira execução, um QR code ASCII aparece nos logs. Escaneie com o WhatsApp do celular. A sessão é salva no volume `wa_session` — restarts não pedem QR novamente.

### Produção

```bash
docker compose -f docker-compose.yml up --build -d
```

### Verificar status

```bash
curl http://localhost:3000/health
# { "ok": true, "whatsappReady": true }
```

### Enviar mensagem

```bash
curl -X POST http://localhost:3000/actions/send-group-message \
  -H "Authorization: Bearer seu-token-aqui" \
  -H "Content-Type: application/json" \
  -d '{"groupId":"XXXXXXXXXX@g.us","message":"Olá!"}'
# { "ok": true }
```

> **Dica:** Para obter o `groupId` de um grupo, você pode temporariamente adicionar um log em `src/server.ts` após o `ready` event: `client.getChats().then(chats => console.log(chats.map(c => ({ id: c.id._serialized, name: c.name }))))`
