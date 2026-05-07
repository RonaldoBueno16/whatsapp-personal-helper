import { client } from '../whatsapp/client';

export type ChatType = 'group' | 'private' | 'all';

interface ListChatsInput {
  type?: ChatType;
  search?: string;
}

interface ChatResult {
  id: string;
  name: string;
  type: 'group' | 'private';
  unreadCount: number;
  isArchived: boolean;
  isPinned: boolean;
  lastMessageTimestamp: number | null;
}

export async function listChats({ type = 'all', search }: ListChatsInput): Promise<ChatResult[]> {
  const chats = await client.getChats();

  const results: ChatResult[] = chats
    .filter((chat) => {
      if (type === 'group') return chat.isGroup;
      if (type === 'private') return !chat.isGroup;
      return true;
    })
    .filter((chat) => {
      if (!search) return true;
      return chat.name.toLowerCase().includes(search.toLowerCase());
    })
    .map((chat) => ({
      id: chat.id._serialized,
      name: chat.name,
      type: chat.isGroup ? 'group' : 'private',
      unreadCount: chat.unreadCount,
      isArchived: chat.archived,
      isPinned: chat.pinned,
      lastMessageTimestamp: chat.lastMessage?.timestamp ?? null,
    }));

  return results;
}
