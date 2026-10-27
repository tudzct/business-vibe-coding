import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource, type EntityManager } from 'typeorm';
import { createHash, randomUUID } from 'node:crypto';
import type { SessionPrincipal } from './auth/session-principal';
import type { JoinSessionDto } from './dto/join-session.dto';
import type { CompleteLiveStreamDto } from './dto/complete-live-stream.dto';
import type { LiveStreamCommandDto } from './dto/live-stream-command.dto';
import type { SessionStateQueryDto } from './dto/session-state-query.dto';

type Row = Record<string, unknown>;
type JsonObject = Record<string, unknown>;

export interface SuccessEnvelope {
  readonly success: true;
  readonly message: string;
  readonly data: JsonObject;
}

interface SessionRow extends Row {
  readonly id: string;
  readonly kind: string;
  readonly status: string;
  readonly designated_host_principal_id: string;
  readonly host_participant_id: string | null;
  readonly version: number;
}

interface ParticipantRow extends Row {
  readonly id: string;
  readonly session_id: string;
  readonly principal_id: string;
  readonly user_id: string;
  readonly display_name: string;
  readonly role: string;
  readonly status: string;
  readonly joined_at: string | Date;
  readonly left_at: string | Date | null;
  readonly microphone_enabled: number | boolean;
  readonly camera_enabled: number | boolean;
  readonly version: number;
}

function firstRow(rows: unknown): Row | undefined {
  return Array.isArray(rows) && rows.length > 0 && isRow(rows[0]) ? rows[0] : undefined;
}

function isRow(value: unknown): value is Row {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toBoolean(value: number | boolean): boolean {
  return value === true || value === 1;
}

function toParticipant(row: ParticipantRow): JsonObject {
  return {
    id: row.id,
    sessionId: row.session_id,
    principalId: row.principal_id,
    userId: row.user_id,
    displayName: row.display_name,
    role: row.role,
    status: row.status,
    joinedAt: row.joined_at,
    leftAt: row.left_at,
    microphoneEnabled: toBoolean(row.microphone_enabled),
    cameraEnabled: toBoolean(row.camera_enabled),
    version: row.version,
  };
}

function toSession(row: SessionRow): JsonObject {
  return {
    id: row.id,
    kind: row.kind,
    status: row.status,
    designatedHostPrincipalId: row.designated_host_principal_id,
    hostParticipantId: row.host_participant_id,
    version: row.version,
  };
}

function parseStoredResponse(value: unknown): SuccessEnvelope {
  if (typeof value === 'string') {
    return parseStoredResponse(JSON.parse(value) as unknown);
  }
  if (
    isRow(value) &&
    value.success === true &&
    typeof value.message === 'string' &&
    isRow(value.data)
  ) {
    return { success: true, message: value.message, data: value.data };
  }
  throw new ConflictException('The previous command response is unavailable');
}

function isDatabaseError(error: unknown, code: string): boolean {
  return isRow(error) && error.code === code;
}

@Injectable()
export class SessionsService {
  constructor(private readonly dataSource: DataSource) {}

  async join(
    sessionId: string,
    idempotencyKey: string | undefined,
    command: JoinSessionDto,
    principal: SessionPrincipal,
  ): Promise<SuccessEnvelope> {
    if (!idempotencyKey?.trim()) {
      throw new BadRequestException('Idempotency-Key is required');
    }
    if (principal.sessionId !== sessionId) {
      throw new ForbiddenException('The requested session is not authorized');
    }

    const payload = {
      displayName: command.displayName.trim(),
      microphoneEnabled: command.microphoneEnabled,
      cameraEnabled: command.cameraEnabled,
      microphoneDeviceId: command.microphoneDeviceId ?? null,
      cameraDeviceId: command.cameraDeviceId ?? null,
      speakerDeviceId: command.speakerDeviceId ?? null,
      virtualBackgroundId: command.virtualBackgroundId ?? null,
    };
    if (!payload.displayName) throw new BadRequestException('Display name is required');
    const payloadHash = createHash('sha256').update(JSON.stringify(payload)).digest('hex');

    try {
      return await this.dataSource.transaction('SERIALIZABLE', async (manager) =>
        this.executeJoin(manager, sessionId, idempotencyKey, payloadHash, payload, principal),
      );
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      if (isDatabaseError(error, 'ER_DUP_ENTRY')) {
        throw new ConflictException('The session join command conflicts with current state');
      }
      if (isDatabaseError(error, 'ER_LOCK_DEADLOCK') || isDatabaseError(error, 'ER_LOCK_WAIT_TIMEOUT')) {
        throw new ServiceUnavailableException('The session is temporarily unavailable');
      }
      throw new ServiceUnavailableException('The session service is temporarily unavailable');
    }
  }

  async getState(
    sessionId: string,
    query: SessionStateQueryDto,
    principal: SessionPrincipal,
  ): Promise<SuccessEnvelope> {
    if (principal.sessionId !== sessionId) {
      throw new ForbiddenException('The requested session is not authorized');
    }
    try {
      const session = await this.findSession(this.dataSource.manager, sessionId, false);
      const participant = await this.findActiveParticipant(this.dataSource.manager, sessionId, principal.principalId);
      if (!participant) throw new NotFoundException('The participant is unavailable');
      const media = await this.findMedia(this.dataSource.manager, participant.id);
      const view = await this.findView(this.dataSource.manager, participant.id);
      const stream = firstRow(await this.dataSource.manager.query(
        'SELECT id, session_id, status, version, started_at, ended_at FROM live_streams WHERE session_id = ?',
        [sessionId],
      )) ?? null;
      const recording = firstRow(await this.dataSource.manager.query(
        'SELECT id, session_id, started_by_participant_id, status, version, created_at, started_at, stopped_at FROM recordings WHERE session_id = ? ORDER BY created_at DESC LIMIT 1',
        [sessionId],
      )) ?? null;
      const share = firstRow(await this.dataSource.manager.query(
        'SELECT id, session_id, owner_participant_id, kind, status, version, started_at, stopped_at FROM content_shares WHERE session_id = ? AND status = \'ACTIVE\' LIMIT 1',
        [sessionId],
      )) ?? null;
      const rawReactions: unknown = await this.dataSource.manager.query(
        'SELECT id, session_id, participant_id, reaction, created_at, sequence FROM reaction_events WHERE session_id = ? ORDER BY sequence ASC LIMIT 50',
        [sessionId],
      );
      const reactions = Array.isArray(rawReactions) ? rawReactions.filter(isRow) : [];

      return this.success({
        session: toSession(session),
        selfParticipant: toParticipant(participant),
        stream,
        recording,
        share,
        media,
        view,
        stageRequests: [],
        reactions,
        nextReactionCursor: query.reactionCursor ?? '',
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      throw new ServiceUnavailableException('The session service is temporarily unavailable');
    }
  }

  async commandLiveStream(
    sessionId: string,
    idempotencyKey: string | undefined,
    command: LiveStreamCommandDto,
    principal: SessionPrincipal,
  ): Promise<SuccessEnvelope> {
    if (!idempotencyKey?.trim()) {
      throw new BadRequestException('Idempotency-Key is required');
    }
    if (principal.sessionId !== sessionId) {
      throw new ForbiddenException('The requested session is not authorized');
    }

    const payload = {
      action: command.action,
      expectedVersion: command.expectedVersion,
    };
    const payloadHash = createHash('sha256').update(JSON.stringify(payload)).digest('hex');

    try {
      return await this.dataSource.transaction('SERIALIZABLE', async (manager) => {
        const existing = firstRow(await manager.query(
          'SELECT payload_hash, response_reference FROM idempotency_records WHERE principal_id = ? AND session_id = ? AND operation = ? AND idempotency_key = ? FOR UPDATE',
          [principal.principalId, sessionId, 'live-stream-command', idempotencyKey],
        ));
        if (existing) {
          if (existing.payload_hash !== payloadHash) {
            throw new ConflictException('Idempotency-Key was already used for a different command');
          }
          const replay = firstRow(await manager.query(
            'SELECT response_body FROM idempotency_responses WHERE id = ?',
            [existing.response_reference],
          ));
          if (!replay) throw new ConflictException('The previous command response is unavailable');
          return parseStoredResponse(replay.response_body);
        }

        const session = await this.findSession(manager, sessionId, true);
        if (session.status === 'ENDED') {
          throw new UnprocessableEntityException(`The stream cannot be ${command.action === 'STOP' ? 'stopped' : 'started'}`);
        }
        if (session.kind !== 'LIVE_STREAM') {
          throw new UnprocessableEntityException('The session is not a live stream');
        }

        const participant = await this.findActiveParticipant(manager, sessionId, principal.principalId, true);
        if (!participant || participant.role !== 'HOST') {
          throw new ForbiddenException(`The caller is not authorized to ${command.action === 'STOP' ? 'stop' : 'start'} this live stream`);
        }

        let stream = firstRow(await manager.query(
          'SELECT id, session_id, status, version, started_at, ended_at FROM live_streams WHERE session_id = ? FOR UPDATE',
          [sessionId],
        ));
        if (!stream) {
          if (command.expectedVersion !== 0) {
            throw new NotFoundException('The live stream is unavailable');
          }
          const newStreamId = randomUUID();
          await manager.query(
            'INSERT INTO live_streams (id, session_id, status, version) VALUES (?, ?, \'READY\', 0)',
            [newStreamId, sessionId],
          );
          stream = firstRow(await manager.query(
            'SELECT id, session_id, status, version, started_at, ended_at FROM live_streams WHERE id = ? FOR UPDATE',
            [newStreamId],
          ));
        }

        if (!stream) {
          throw new NotFoundException('The live stream is unavailable');
        }

        if (stream.version !== command.expectedVersion) {
          throw new ConflictException('The stream version is no longer current');
        }

        if (command.action === 'START') {
          if (stream.status !== 'READY') {
            throw new UnprocessableEntityException('The stream cannot be started in its current state');
          }
          await manager.query(
            'UPDATE live_streams SET status = \'STARTING\', version = version + 1 WHERE id = ?',
            [stream.id],
          );
          await manager.query(
            'UPDATE sessions SET status = \'LIVE\', version = version + 1 WHERE id = ?',
            [sessionId],
          );
        } else if (command.action === 'STOP') {
          if (stream.status !== 'LIVE' && stream.status !== 'STARTING') {
            throw new UnprocessableEntityException('The stream cannot be stopped in its current state');
          }
          await manager.query(
            'UPDATE live_streams SET status = \'ENDED\', version = version + 1, ended_at = UTC_TIMESTAMP(3) WHERE id = ?',
            [stream.id],
          );
          await manager.query(
            'UPDATE participants SET role = \'VIEWER\', microphone_enabled = false, camera_enabled = false, version = version + 1 WHERE session_id = ? AND status = \'JOINED\' AND role = \'STAGE_PARTICIPANT\'',
            [sessionId],
          );
          await manager.query(
            'UPDATE content_shares SET status = \'STOPPED\', version = version + 1, stopped_at = UTC_TIMESTAMP(3) WHERE session_id = ? AND status = \'ACTIVE\'',
            [sessionId],
          );
          await manager.query(
            'UPDATE stage_requests SET status = \'CANCELLED\', version = version + 1, decided_at = UTC_TIMESTAMP(3) WHERE session_id = ? AND status = \'PENDING\'',
            [sessionId],
          );
          await manager.query(
            'UPDATE recordings SET status = \'STOPPED\', version = version + 1, stopped_at = UTC_TIMESTAMP(3) WHERE session_id = ? AND status IN (\'STARTING\', \'RECORDING\')',
            [sessionId],
          );
          await manager.query(
            'UPDATE sessions SET version = version + 1 WHERE id = ?',
            [sessionId],
          );
        }

        const updatedStream = firstRow(await manager.query(
          'SELECT id, session_id AS sessionId, status, version, started_at AS startedAt, ended_at AS endedAt FROM live_streams WHERE id = ?',
          [stream.id],
        ));
        const updatedSession = toSession(await this.findSession(manager, sessionId, false));

        const response: SuccessEnvelope = {
          success: true,
          message: 'The stream command was completed.',
          data: {
            stream: updatedStream ?? {},
            session: updatedSession,
          },
        };

        const responseId = randomUUID();
        await manager.query(
          'INSERT INTO idempotency_responses (id, status_code, response_body) VALUES (?, ?, ?)',
          [responseId, 200, JSON.stringify(response)],
        );
        await manager.query(
          'INSERT INTO idempotency_records (principal_id, session_id, operation, idempotency_key, payload_hash, response_reference, completed_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(3), DATE_ADD(UTC_TIMESTAMP(3), INTERVAL 24 HOUR))',
          [principal.principalId, sessionId, 'live-stream-command', idempotencyKey, payloadHash, responseId],
        );

        return response;
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      if (isDatabaseError(error, 'ER_DUP_ENTRY')) {
        throw new ConflictException('The stream command conflicts with current state');
      }
      if (isDatabaseError(error, 'ER_LOCK_DEADLOCK') || isDatabaseError(error, 'ER_LOCK_WAIT_TIMEOUT')) {
        throw new ServiceUnavailableException('The session is temporarily unavailable');
      }
      throw new ServiceUnavailableException('The session service is temporarily unavailable');
    }
  }

  async completeLiveStream(sessionId: string, command: CompleteLiveStreamDto, principal: SessionPrincipal): Promise<SuccessEnvelope> {
    if (principal.sessionId !== sessionId) throw new ForbiddenException('The requested session is not authorized');
    return this.dataSource.transaction('SERIALIZABLE', async (manager) => {
      const session = await this.findSession(manager, sessionId, true);
      const stream = firstRow(await manager.query('SELECT id, status, version, session_id FROM live_streams WHERE session_id = ? FOR UPDATE', [sessionId]));
      if (!stream) throw new NotFoundException('The live stream is unavailable');
      if (session.status !== 'LIVE' || stream.status !== 'STARTING') throw new UnprocessableEntityException('The stream completion is not valid in its current state');
      if (stream.id !== command.resourceId || stream.version !== command.expectedVersion) throw new ConflictException('The stream completion version is no longer current');
      await manager.query('UPDATE live_streams SET status = ?, version = version + 1, started_at = CASE WHEN ? THEN UTC_TIMESTAMP(3) ELSE started_at END WHERE id = ?', [command.succeeded ? 'LIVE' : 'READY', command.succeeded, stream.id]);
      await manager.query('UPDATE sessions SET version = version + 1 WHERE id = ?', [sessionId]);
      return this.success({ stream: firstRow(await manager.query('SELECT id, session_id AS sessionId, status, version, started_at AS startedAt, ended_at AS endedAt FROM live_streams WHERE id = ?', [stream.id])) ?? {}, session: toSession(await this.findSession(manager, sessionId, false)) });
    });
  }

  private async executeJoin(
    manager: EntityManager,
    sessionId: string,
    idempotencyKey: string,
    payloadHash: string,
    payload: {
      readonly displayName: string;
      readonly microphoneEnabled: boolean;
      readonly cameraEnabled: boolean;
      readonly microphoneDeviceId: string | null;
      readonly cameraDeviceId: string | null;
      readonly speakerDeviceId: string | null;
      readonly virtualBackgroundId: string | null;
    },
    principal: SessionPrincipal,
  ): Promise<SuccessEnvelope> {
    const existing = firstRow(await manager.query(
      'SELECT payload_hash, response_reference FROM idempotency_records WHERE principal_id = ? AND session_id = ? AND operation = ? AND idempotency_key = ? FOR UPDATE',
      [principal.principalId, sessionId, 'join-session', idempotencyKey],
    ));
    if (existing) {
      if (existing.payload_hash !== payloadHash) {
        throw new ConflictException('Idempotency-Key was already used for a different command');
      }
      const replay = firstRow(await manager.query(
        'SELECT response_body FROM idempotency_responses WHERE id = ?',
        [existing.response_reference],
      ));
      if (!replay) throw new ConflictException('The previous command response is unavailable');
      return parseStoredResponse(replay.response_body);
    }

    const session = await this.findSession(manager, sessionId, true);
    if (session.status === 'ENDED') {
      throw new UnprocessableEntityException('The session cannot be joined');
    }
    const existingParticipant = await this.findActiveParticipant(manager, sessionId, principal.principalId, true);
    if (existingParticipant) {
      throw new ConflictException('The principal has already joined this session');
    }

    const participantId = randomUUID();
    const role = session.designated_host_principal_id === principal.principalId ? 'HOST' : 'VIEWER';
    await manager.query(
      'INSERT INTO participants (id, session_id, principal_id, user_id, display_name, role, status, microphone_enabled, camera_enabled, version) VALUES (?, ?, ?, ?, ?, ?, \'JOINED\', ?, ?, 1)',
      [participantId, sessionId, principal.principalId, principal.userId, payload.displayName, role, payload.microphoneEnabled, payload.cameraEnabled],
    );
    await manager.query(
      'INSERT INTO media_preferences (participant_id, microphone_device_id, camera_device_id, speaker_device_id, virtual_background_id) VALUES (?, ?, ?, ?, ?)',
      [participantId, payload.microphoneDeviceId, payload.cameraDeviceId, payload.speakerDeviceId, payload.virtualBackgroundId],
    );
    await manager.query(
      'INSERT INTO view_preferences (participant_id, layout, focused_participant_id, side_panel, picture_in_picture) VALUES (?, \'EQUAL_PROMINENCE\', NULL, NULL, false)',
      [participantId],
    );
    if (role === 'HOST') {
      await manager.query('UPDATE sessions SET host_participant_id = ?, version = version + 1 WHERE id = ?', [participantId, sessionId]);
    }

    const participant = await this.findActiveParticipant(manager, sessionId, principal.principalId);
    if (!participant) throw new ServiceUnavailableException('The joined participant is unavailable');
    const media = await this.findMedia(manager, participantId);
    const view = await this.findView(manager, participantId);
    const response = this.success({
      participant: toParticipant(participant),
      session: toSession(await this.findSession(manager, sessionId, false)),
      stream: firstRow(await manager.query('SELECT id, session_id, status, version, started_at, ended_at FROM live_streams WHERE session_id = ?', [sessionId])) ?? null,
      media,
      view,
    });
    const responseId = randomUUID();
    await manager.query('INSERT INTO idempotency_responses (id, status_code, response_body) VALUES (?, ?, ?)', [responseId, 201, JSON.stringify(response)]);
    await manager.query(
      'INSERT INTO idempotency_records (principal_id, session_id, operation, idempotency_key, payload_hash, response_reference, completed_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(3), DATE_ADD(UTC_TIMESTAMP(3), INTERVAL 24 HOUR))',
      [principal.principalId, sessionId, 'join-session', idempotencyKey, payloadHash, responseId],
    );
    return response;
  }

  private async findSession(manager: EntityManager, sessionId: string, lock: boolean): Promise<SessionRow> {
    const sql = `SELECT id, kind, status, designated_host_principal_id, host_participant_id, version FROM sessions WHERE id = ?${lock ? ' FOR UPDATE' : ''}`;
    const row = firstRow(await manager.query(sql, [sessionId]));
    if (!row) throw new NotFoundException('The session is unavailable');
    return row as SessionRow;
  }

  private async findActiveParticipant(manager: EntityManager, sessionId: string, principalId: string, lock = false): Promise<ParticipantRow | undefined> {
    const sql = `SELECT id, session_id, principal_id, user_id, display_name, role, status, joined_at, left_at, microphone_enabled, camera_enabled, version FROM participants WHERE session_id = ? AND principal_id = ? AND status = 'JOINED'${lock ? ' FOR UPDATE' : ''}`;
    const row = firstRow(await manager.query(sql, [sessionId, principalId]));
    return row as ParticipantRow | undefined;
  }

  private async findMedia(manager: EntityManager, participantId: string): Promise<JsonObject> {
    return firstRow(await manager.query(
      'SELECT participant_id AS participantId, microphone_device_id AS microphoneDeviceId, camera_device_id AS cameraDeviceId, speaker_device_id AS speakerDeviceId, virtual_background_id AS virtualBackgroundId, updated_at AS updatedAt FROM media_preferences WHERE participant_id = ?',
      [participantId],
    )) ?? {};
  }

  private async findView(manager: EntityManager, participantId: string): Promise<JsonObject> {
    return firstRow(await manager.query(
      'SELECT participant_id AS participantId, layout, focused_participant_id AS focusedParticipantId, side_panel AS sidePanel, picture_in_picture AS pictureInPicture, updated_at AS updatedAt FROM view_preferences WHERE participant_id = ?',
      [participantId],
    )) ?? {};
  }

  private success(data: JsonObject): SuccessEnvelope {
    return { success: true, message: 'Session joined', data };
  }
}
