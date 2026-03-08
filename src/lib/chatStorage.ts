export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  actionCommand?: string;
}

interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: number;
}

const STORAGE_KEY = "lily-chat-history";

export function getStoredChats(): Chat[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveChat(chat: Chat): void {
  if (typeof window === "undefined") return;
  try {
    const chats = getStoredChats();
    const existingIndex = chats.findIndex((c) => c.id === chat.id);
    if (existingIndex >= 0) {
      chats[existingIndex] = chat;
    } else {
      chats.unshift(chat);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats.slice(0, 50)));
  } catch {
    console.error("Failed to save chat");
  }
}

export function deleteChat(chatId: string): void {
  if (typeof window === "undefined") return;
  try {
    const chats = getStoredChats().filter((c) => c.id !== chatId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  } catch {
    console.error("Failed to delete chat");
  }
}

export function generateChatTitle(firstMessage: string): string {
  const preview = firstMessage.slice(0, 40).trim();
  return preview.length < firstMessage.length ? `${preview}...` : preview;
}
