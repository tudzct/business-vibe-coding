import axios from 'axios';

export type JoinRequest = {
  displayName: string;
  microphoneEnabled: boolean;
  cameraEnabled: boolean;
  microphoneDeviceId: string | null;
  cameraDeviceId: string | null;
  speakerDeviceId: string | null;
  virtualBackgroundId: string | null;
};

export type JoinResponse = {
  participant: { id: string; displayName: string; role: string; microphoneEnabled: boolean; cameraEnabled: boolean };
  session: Record<string, unknown>;
  stream: Record<string, unknown> | null;
  media: Record<string, unknown>;
  view: Record<string, unknown>;
};

type Envelope = { success: boolean; message: string; data: JoinResponse };

const client = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL ?? '' });

export async function joinSession(
  sessionId: string,
  accessToken: string,
  idempotencyKey: string,
  request: JoinRequest,
  signal?: AbortSignal,
): Promise<JoinResponse> {
  const response = await client.post<Envelope>(
    `/api/v1/sessions/${encodeURIComponent(sessionId)}/participants`,
    request,
    {
      signal,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
    },
  );
  return response.data.data;
}
