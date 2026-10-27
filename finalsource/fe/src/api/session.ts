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
  readonly role?: 'HOST' | 'BROADCASTER' | 'VIEWER' | 'STAGE_PARTICIPANT' | string;
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

export interface LiveStream { readonly id: string; readonly status: 'READY' | 'STARTING' | 'LIVE' | 'ENDED'; readonly version: number; }
export interface SessionStateData { readonly session: { readonly id: string; readonly status: string; readonly kind: string; readonly version: number }; readonly selfParticipant: Participant; readonly stream: LiveStream | null; readonly recording: Record<string, unknown> | null; readonly share: Record<string, unknown> | null; readonly media: Record<string, unknown>; readonly view: Record<string, unknown>; readonly stageRequests: readonly Record<string, unknown>[]; readonly reactions: readonly Record<string, unknown>[]; readonly nextReactionCursor: string; }
export interface StreamCommandData { readonly stream: LiveStream; readonly session: SessionStateData['session']; }
export interface LiveStreamViewData {
  readonly sessionId: string;
  readonly participantId: string;
  readonly viewerRole: 'VIEWER' | 'STAGE_PARTICIPANT';
  readonly streamStatus: 'READY' | 'STARTING' | 'LIVE' | 'ENDED';
  readonly streamVersion: number;
  readonly sessionVersion: number;
}

export async function getSessionState(sessionId: string, accessToken: string, signal?: AbortSignal): Promise<SessionStateData> {
  try { return (await apiClient.get<SuccessEnvelope<SessionStateData>>(`/api/v1/sessions/${encodeURIComponent(sessionId)}/state`, { headers: { Authorization: `Bearer ${accessToken}` }, signal })).data.data; }
  catch (error: unknown) { throw new SessionApiError(error instanceof AxiosError ? ((error.response?.data as ErrorEnvelope | undefined)?.message ?? 'The updated session state could not be loaded.') : 'The updated session state could not be loaded.'); }
}

export async function getLiveStreamView(sessionId: string, accessToken: string, signal?: AbortSignal): Promise<LiveStreamViewData> {
  try {
    return (await apiClient.get<SuccessEnvelope<LiveStreamViewData>>(
      `/api/v1/sessions/${encodeURIComponent(sessionId)}/live-stream/view`,
      { headers: { Authorization: `Bearer ${accessToken}` }, signal },
    )).data.data;
  } catch (error: unknown) {
    throw new SessionApiError(error instanceof AxiosError ? ((error.response?.data as ErrorEnvelope | undefined)?.message ?? 'The live session could not be loaded. Please try again.') : 'The live session could not be loaded. Please try again.');
  }
}
export async function startLiveStream(sessionId: string, accessToken: string, idempotencyKey: string, expectedVersion: number): Promise<StreamCommandData> {
  try { return (await apiClient.post<SuccessEnvelope<StreamCommandData>>(`/api/v1/sessions/${encodeURIComponent(sessionId)}/live-stream/commands`, { action: 'START', expectedVersion }, { headers: { Authorization: `Bearer ${accessToken}`, 'Idempotency-Key': idempotencyKey } })).data.data; }
  catch (error: unknown) { throw new SessionApiError(error instanceof AxiosError ? ((error.response?.data as ErrorEnvelope | undefined)?.message ?? 'The live stream could not be started.') : 'The live stream could not be started.'); }
}

export async function stopLiveStream(sessionId: string, accessToken: string, idempotencyKey: string, expectedVersion: number): Promise<StreamCommandData> {
  try {
    return (await apiClient.post<SuccessEnvelope<StreamCommandData>>(
      `/api/v1/sessions/${encodeURIComponent(sessionId)}/live-stream/commands`,
      { action: 'STOP', expectedVersion },
      { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey } },
    )).data.data;
  } catch (error: unknown) {
    throw new SessionApiError(error instanceof AxiosError ? ((error.response?.data as ErrorEnvelope | undefined)?.message ?? 'The live stream could not be ended.') : 'The live stream could not be ended.');
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
