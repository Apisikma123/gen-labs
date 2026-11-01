import { TutorState, SourceItem } from '@/lib/api/ai';
import { ModuleModel } from '@/lib/api/modules';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  state?: TutorState;
  sources?: SourceItem[];
  matchedModules?: ModuleModel[];
  suggestedFollowUp?: string[];
  timestamp: string; // ISO string
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  discipline?: string;
  messages: ChatMessage[];
}

export interface GroupedConversations {
  today: ChatConversation[];
  yesterday: ChatConversation[];
  previous: ChatConversation[];
}

const STORAGE_PREFIX = 'genlabs_tanya_conversations_';

function getStorageKey(userId?: number | string): string {
  return `${STORAGE_PREFIX}${userId ? String(userId) : 'guest'}`;
}

/**
 * Safely parse JSON from localStorage without throwing errors.
 */
function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Generate a clean, readable default title from user question.
 */
export function deriveConversationTitle(firstQuestion: string): string {
  if (!firstQuestion) return 'Percakapan Baru';
  const clean = firstQuestion.trim().replace(/^\[.*?\]\s*/, '');
  if (clean.length <= 40) return clean;
  return clean.slice(0, 38).trim() + '…';
}

/**
 * Retrieve all saved conversations for the given user, sorted newest first.
 */
export function getConversations(userId?: number | string): ChatConversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    const items = safeJsonParse<ChatConversation[]>(raw, []);
    return Array.isArray(items) ? items.sort((a, b) => b.updatedAt - a.updatedAt) : [];
  } catch {
    return [];
  }
}

/**
 * Retrieve a specific conversation by ID.
 */
export function getConversation(id: string, userId?: number | string): ChatConversation | null {
  const list = getConversations(userId);
  return list.find((c) => c.id === id) || null;
}

/**
 * Save or update a conversation.
 */
export function saveConversation(conversation: ChatConversation, userId?: number | string): void {
  if (typeof window === 'undefined' || !conversation?.id) return;
  try {
    const list = getConversations(userId);
    const index = list.findIndex((c) => c.id === conversation.id);
    const updated = { ...conversation, updatedAt: Date.now() };

    if (index >= 0) {
      list[index] = updated;
    } else {
      list.unshift(updated);
    }

    // Keep at most 50 conversations per user to avoid hitting localStorage limits
    const capped = list.slice(0, 50);
    localStorage.setItem(getStorageKey(userId), JSON.stringify(capped));
  } catch (e) {
    console.warn('Failed to save conversation to localStorage', e);
  }
}

/**
 * Create a new empty conversation session.
 */
export function createNewConversation(
  title?: string,
  discipline?: string,
  userId?: number | string
): ChatConversation {
  const now = Date.now();
  const id = `conv_${now}_${Math.random().toString(36).slice(2, 7)}`;
  const newConv: ChatConversation = {
    id,
    title: title || 'Percakapan Baru',
    createdAt: now,
    updatedAt: now,
    discipline: discipline || 'all',
    messages: [],
  };

  saveConversation(newConv, userId);
  return newConv;
}

/**
 * Delete a conversation by ID.
 */
export function deleteConversation(id: string, userId?: number | string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getConversations(userId);
    const filtered = list.filter((c) => c.id !== id);
    localStorage.setItem(getStorageKey(userId), JSON.stringify(filtered));
  } catch (e) {
    console.warn('Failed to delete conversation', e);
  }
}

/**
 * Rename a conversation.
 */
export function renameConversation(id: string, newTitle: string, userId?: number | string): void {
  if (typeof window === 'undefined' || !newTitle.trim()) return;
  try {
    const list = getConversations(userId);
    const item = list.find((c) => c.id === id);
    if (item) {
      item.title = newTitle.trim();
      item.updatedAt = Date.now();
      localStorage.setItem(getStorageKey(userId), JSON.stringify(list));
    }
  } catch (e) {
    console.warn('Failed to rename conversation', e);
  }
}

/**
 * Group conversations chronologically: Hari Ini, Kemarin, Sebelumnya.
 */
export function groupConversationsByDate(conversations: ChatConversation[]): GroupedConversations {
  const now = new Date();
  const todayStr = now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const today: ChatConversation[] = [];
  const yesterdayList: ChatConversation[] = [];
  const previous: ChatConversation[] = [];

  for (const conv of conversations) {
    const d = new Date(conv.updatedAt || conv.createdAt);
    const dateStr = d.toDateString();

    if (dateStr === todayStr) {
      today.push(conv);
    } else if (dateStr === yesterdayStr) {
      yesterdayList.push(conv);
    } else {
      previous.push(conv);
    }
  }

  return {
    today,
    yesterday: yesterdayList,
    previous,
  };
}

const ACTIVE_CONV_PREFIX = 'genlabs_active_conv_';

/**
 * Retrieve the last active conversation ID for a user.
 */
export function getActiveConversationId(userId?: number | string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = `${ACTIVE_CONV_PREFIX}${userId ? String(userId) : 'guest'}`;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Persist the currently active conversation ID for a user.
 */
export function setActiveConversationId(id: string, userId?: number | string): void {
  if (typeof window === 'undefined') return;
  try {
    const key = `${ACTIVE_CONV_PREFIX}${userId ? String(userId) : 'guest'}`;
    if (id) {
      localStorage.setItem(key, id);
    } else {
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.warn('Failed to save active conversation ID', e);
  }
}

/**
 * Clear the active conversation ID for a user.
 */
export function clearActiveConversationId(userId?: number | string): void {
  if (typeof window === 'undefined') return;
  try {
    const key = `${ACTIVE_CONV_PREFIX}${userId ? String(userId) : 'guest'}`;
    localStorage.removeItem(key);
  } catch {}
}
