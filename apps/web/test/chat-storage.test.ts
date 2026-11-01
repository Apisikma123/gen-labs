import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deriveConversationTitle,
  groupConversationsByDate,
  ChatConversation,
} from '../src/lib/storage/chat-storage';

test('Tanya AI Storage: deriveConversationTitle extracts concise title', () => {
  assert.equal(
    deriveConversationTitle('Bagaimana hukum Newton kedua bekerja?'),
    'Bagaimana hukum Newton kedua bekerja?'
  );

  assert.equal(
    deriveConversationTitle('[Disiplin: Fisika Terapan] Jelaskan pengaruh massa terhadap percepatan benda'),
    'Jelaskan pengaruh massa terhadap perce…'
  );

  assert.equal(
    deriveConversationTitle(''),
    'Percakapan Baru'
  );
});

test('Tanya AI Storage: groupConversationsByDate correctly segments today, yesterday, and earlier sessions', () => {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const mockConversations: ChatConversation[] = [
    {
      id: 'conv_today',
      title: 'Eksperimen Hari Ini',
      createdAt: now,
      updatedAt: now,
      messages: [],
    },
    {
      id: 'conv_yesterday',
      title: 'Percakapan Kemarin',
      createdAt: now - oneDayMs,
      updatedAt: now - oneDayMs,
      messages: [],
    },
    {
      id: 'conv_last_week',
      title: 'Percakapan Minggu Lalu',
      createdAt: now - (5 * oneDayMs),
      updatedAt: now - (5 * oneDayMs),
      messages: [],
    },
  ];

  const grouped = groupConversationsByDate(mockConversations);

  assert.equal(grouped.today.length, 1);
  assert.equal(grouped.today[0].id, 'conv_today');

  assert.equal(grouped.yesterday.length, 1);
  assert.equal(grouped.yesterday[0].id, 'conv_yesterday');

  assert.equal(grouped.previous.length, 1);
  assert.equal(grouped.previous[0].id, 'conv_last_week');
});
