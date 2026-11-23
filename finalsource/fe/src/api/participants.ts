import axios from 'axios';

export type ParticipantRole = 'HOST' | 'BROADCASTER' | 'VIEWER' | 'STAGE_PARTICIPANT';
export type Participant = { id: string; displayName: string; role: ParticipantRole; status: 'JOINED' | 'LEFT'; joinedAt: string };
type Envelope = { success: boolean; message: string; data: { items: Participant[]; nextCursor: string | null } };

const client = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? '' });

export async function listParticipants(sessionId: string, accessToken: string, cursor?: string, signal?: AbortSignal): Promise<Envelope['data']> {
  if (!sessionId.trim()) throw new Error('Session identifier is required.');
  if (!accessToken.trim()) throw new Error('Session access is required.');
  const response = await client.get<Envelope>(`/api/v1/sessions/${encodeURIComponent(sessionId)}/participants`, {
    params: cursor ? { pageSize: 50, cursor } : { pageSize: 50 },
    signal,
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
  });
  if (!response.data.success || !Array.isArray(response.data.data?.items)) throw new Error('Participant list unavailable.');
  return response.data.data;
}
