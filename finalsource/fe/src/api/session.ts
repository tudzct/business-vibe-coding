import { AxiosError } from 'axios';
import { apiClient } from './client';

export interface JoinSessionRequest {
  readonly displayName: string;
  readonly microphoneEnabled: boolean;
  readonly cameraEnabled: boolean;
  readonly microphoneDeviceId: string | null;
  readonly cameraDeviceId: string | null;
  readonly speakerDeviceId: string | null;
  readonly virtualBackgroundId: string | null;
}

export interface Participant {
  readonly id: string;
  readonly displayName: string;
  readonly microphoneEnabled: boolean;
  readonly cameraEnabled: boolean;
}

export interface JoinSessionData {
  readonly participant: Participant;
  readonly session: { readonly id: string; readonly status: string; readonly kind: string };
  readonly stream: unknown | null;
  readonly media: Record<string, unknown>;
  readonly view: Record<string, unknown>;
}

interface SuccessEnvelope<T> {
  readonly success: true;
  readonly message: string;
  readonly data: T;
}

interface ErrorEnvelope {
  readonly success: false;
  readonly message: string;
}

export class SessionApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SessionApiError';
  }
}

export async function joinSession(
  sessionId: string,
  accessToken: string,
  idempotencyKey: string,
  payload: JoinSessionRequest,
): Promise<JoinSessionData> {
  try {
    const response = await apiClient.post<SuccessEnvelope<JoinSessionData>>(
      `/api/v1/sessions/${encodeURIComponent(sessionId)}/participants`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey } },
    );
    return response.data.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const response = error.response?.data as ErrorEnvelope | undefined;
      throw new SessionApiError(response?.message ?? 'The session could not be joined. Please try again.');
    }
    throw new SessionApiError('The session could not be joined. Please try again.');
  }
}
