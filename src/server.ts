import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { authMiddleware } from './middleware/auth';
import { readinessGate } from './middleware/readiness';
import { isReady, initWhatsApp } from './whatsapp/client';
import actionsRouter from './routes/index';
import { swaggerSpec } from './swagger';

const app = express();
app.use(express.json());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs.json', (_req, res) => res.json(swaggerSpec));

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Verifica se a API está online e o WhatsApp conectado
 *     tags: [Status]
 *     security: []
 *     responses:
 *       200:
 *         description: Status da aplicação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 whatsappReady:
 *                   type: boolean
 *
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 */
app.get('/health', (_req, res) => {
  res.json({ ok: true, whatsappReady: isReady });
});

app.use('/actions', authMiddleware, readinessGate, actionsRouter);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

initWhatsApp();
