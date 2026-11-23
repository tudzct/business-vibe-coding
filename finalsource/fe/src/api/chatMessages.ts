import axios from 'axios';

export type ChatMessage = { id: string; sessionId: string; senderParticipantId: string; body: string; sentAt: string; sequence: number };
type ListEnvelope = { success: boolean; message: string; data: { items: ChatMessage[]; nextCursor: string } };
type CreateEnvelope = { success: boolean; message: string; data: { message: ChatMessage } };
const client = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? '' });

export async function listChatMessages(sessionId: string, accessToken: string, cursor?: string, signal?: AbortSignal): Promise<ListEnvelope['data']> {
  if (!sessionId.trim()) throw new Error('Session identifier is required.');
  if (!accessToken.trim()) throw new Error('Session access is required.');
  const response = await client.get<ListEnvelope>(`/api/v1/sessions/${encodeURIComponent(sessionId)}/chat/messages`, { params: { pageSize: 50, ...(cursor ? { cursor } : {}) }, signal, headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } });
  if (!response.data.success || !Array.isArray(response.data.data?.items)) throw new Error('Chat history could not be loaded.');
  return response.data.data;
}

export async function sendChatMessage(sessionId: string, accessToken: string, body: string, idempotencyKey = crypto.randomUUID(), signal?: AbortSignal): Promise<CreateEnvelope['data']> {
  const response = await client.post<CreateEnvelope>(`/api/v1/sessions/${encodeURIComponent(sessionId)}/chat/messages`, JSON.stringify(body), { signal, headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey } });
  if (!response.data.success || !response.data.data?.message) throw new Error('Chat message could not be sent.');
  return response.data.data;
}
