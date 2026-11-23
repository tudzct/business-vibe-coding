import axios from 'axios';

export const reactionCodes = ['LIKE', 'CLAP', 'HEART', 'CELEBRATE', 'HAND', 'SURPRISE'] as const;
export type ReactionCode = (typeof reactionCodes)[number];
export type ReactionEvent = { id: string; sessionId: string; participantId: string; reaction: ReactionCode; createdAt: string; sequence: number };
type Envelope = { success: boolean; message: string; data: { reaction: ReactionEvent } };
const client = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? '' });

export async function sendReaction(sessionId: string, accessToken: string, reaction: ReactionCode, idempotencyKey = crypto.randomUUID(), signal?: AbortSignal): Promise<Envelope['data']> {
  if (!sessionId.trim()) throw new Error('Session identifier is required.');
  if (!accessToken.trim()) throw new Error('Session access is required.');
  if (!reactionCodes.includes(reaction)) throw new Error('Choose a reaction.');
  const response = await client.post<Envelope>(`/api/v1/sessions/${encodeURIComponent(sessionId)}/reactions`, { reaction }, { signal, headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey } });
  if (!response.data.success || !response.data.data?.reaction) throw new Error('Reaction could not be sent.');
  return response.data.data;
}
