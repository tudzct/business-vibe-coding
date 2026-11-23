import axios from 'axios';

export type Stream = { id: string; sessionId: string; status: 'READY' | 'STARTING' | 'LIVE' | 'ENDED'; version: number; startedAt: string | null; endedAt: string | null };
export type SessionState = { session: { kind: string; status: string; version: number }; selfParticipant: { displayName: string; role: string }; stream: Stream | null };
type Envelope<T> = { success: boolean; message: string; data: T };
const client = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? '' });

export async function readSessionState(sessionId: string, accessToken: string, signal?: AbortSignal): Promise<SessionState> {
  const response = await client.get<Envelope<SessionState>>(`/api/v1/sessions/${encodeURIComponent(sessionId)}/state`, { signal, headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } });
  return response.data.data;
}

export async function startLiveStream(sessionId: string, accessToken: string, expectedVersion: number, idempotencyKey: string, signal?: AbortSignal): Promise<{ stream: Stream; session: SessionState['session'] }> {
  const response = await client.post<Envelope<{ stream: Stream; session: SessionState['session'] }>>(`/api/v1/sessions/${encodeURIComponent(sessionId)}/live-stream/commands`, { action: 'START', expectedVersion }, { signal, headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey } });
  return response.data.data;
}
