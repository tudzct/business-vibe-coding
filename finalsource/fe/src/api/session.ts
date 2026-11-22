import axios from 'axios';

export interface JoinSessionRequest {
  displayName: string;
  microphoneEnabled: boolean;
  cameraEnabled: boolean;
  microphoneDeviceId: string | null;
  cameraDeviceId: string | null;
  speakerDeviceId: string | null;
  virtualBackgroundId: string | null;
}

export interface JoinSessionResponse {
  success: boolean;
  message: string;
  data: { participant: { displayName: string; microphoneEnabled: boolean; cameraEnabled: boolean }; session: { id: string; status: string }; stream: unknown; media: unknown; view: unknown };
}

const client = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000', headers: { 'Content-Type': 'application/json' } });

export async function joinSession(sessionId: string, request: JoinSessionRequest, accessToken: string): Promise<JoinSessionResponse> {
  const response = await client.post<JoinSessionResponse>(`/api/v1/sessions/${encodeURIComponent(sessionId)}/participants`, request, { headers: { Authorization: `Bearer ${accessToken}`, 'Idempotency-Key': crypto.randomUUID() } });
  return response.data;
}
