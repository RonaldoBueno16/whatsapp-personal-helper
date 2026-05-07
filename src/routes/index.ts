import { Router, Request, Response } from 'express';
import { sendGroupMessage } from '../actions/sendGroupMessage';
import { listChats, ChatType } from '../actions/listChats';

const router = Router();

/**
 * @openapi
 * /actions/send-group-message:
 *   post:
 *     summary: Envia uma mensagem para um grupo do WhatsApp
 *     tags: [Actions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [groupId, message]
 *             properties:
 *               groupId:
 *                 type: string
 *                 description: ID serializado do grupo (ex. 123456789@g.us)
 *                 example: "123456789-1234567890@g.us"
 *               message:
 *                 type: string
 *                 description: Texto da mensagem
 *                 example: "Olá pessoal!"
 *     responses:
 *       200:
 *         description: Mensagem enviada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Parâmetros obrigatórios ausentes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.post('/send-group-message', async (req: Request, res: Response): Promise<void> => {
  const { groupId, message } = req.body;
  try {
    await sendGroupMessage({ groupId, message });
    res.json({ ok: true });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'internal error';
    const status = errorMessage.includes('required') ? 400 : 500;
    res.status(status).json({ error: errorMessage });
  }
});

/**
 * @openapi
 * /actions/chats:
 *   get:
 *     summary: Lista os chats do WhatsApp
 *     tags: [Actions]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [group, private, all]
 *           default: all
 *         description: Filtra por tipo de conversa
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Texto para filtrar pelo nome do chat
 *     responses:
 *       200:
 *         description: Lista de chats retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 total:
 *                   type: integer
 *                   example: 5
 *                 chats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [group, private]
 *                       unreadCount:
 *                         type: integer
 *                       isArchived:
 *                         type: boolean
 *                       isPinned:
 *                         type: boolean
 *                       lastMessageTimestamp:
 *                         type: integer
 *                         nullable: true
 *       500:
 *         description: Erro interno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/chats', async (req: Request, res: Response): Promise<void> => {
  const { type, search } = req.query;

  const validTypes: ChatType[] = ['group', 'private', 'all'];
  const chatType = validTypes.includes(type as ChatType) ? (type as ChatType) : 'all';

  try {
    const chats = await listChats({ type: chatType, search: search as string | undefined });
    res.json({ ok: true, total: chats.length, chats });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'internal error';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
