import { client } from '../whatsapp/client';

interface SendGroupMessageInput {
  groupId: string;
  message: string;
}

export async function sendGroupMessage({ groupId, message }: SendGroupMessageInput): Promise<void> {
  if (!groupId || !message) {
    throw new Error('groupId and message are required');
  }
  await client.sendMessage(groupId, message);
}
