import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { createHash, randomUUID } from 'node:crypto';
import type { JoinSessionDto } from './dto/join-session.dto';

type AuthenticatedRequest = { principalId?: string; userId?: string; sessionId?: string };

@Injectable()
export class SessionJoinService {
  constructor(private readonly dataSource: DataSource) {}

  async join(sessionId: string, dto: JoinSessionDto, idempotencyKey: string | undefined, context: AuthenticatedRequest) {
    if (!context.principalId || !context.userId || !context.sessionId) throw new UnauthorizedException('Authentication context is required.');
    if (context.sessionId !== sessionId) throw new ForbiddenException('The session context is not valid.');
    const key = idempotencyKey?.trim();
    if (!key) throw new UnprocessableEntityException('Idempotency-Key is required.');

    const name = dto.displayName.trim();
    if (!name || name.length > 50) throw new UnprocessableEntityException('Display name must contain 1–50 characters.');
    const payloadHash = createHash('sha256').update(JSON.stringify({ sessionId, ...dto })).digest('hex');

    return this.dataSource.transaction('SERIALIZABLE', async (manager) => {
      const previous = await manager.query(
        'SELECT id, payload_hash, response_reference, expires_at FROM idempotency_records WHERE principal_id = ? AND session_id = ? AND operation = ? AND idempotency_key = ? AND expires_at > CURRENT_TIMESTAMP(3) LIMIT 1',
        [context.principalId, sessionId, 'SESSION_JOIN', key],
      ) as Array<{ payload_hash: string; response_reference: string }>;
      if (previous.length) {
        if (previous[0].payload_hash !== payloadHash) throw new ConflictException('The idempotency key was already used with a different request.');
        const stored = await manager.query('SELECT response_body FROM idempotency_responses WHERE id = ?', [previous[0].response_reference]) as Array<{ response_body: string | object }>;
        return typeof stored[0]?.response_body === 'string' ? JSON.parse(stored[0].response_body) : stored[0]?.response_body;
      }

      const sessions = await manager.query('SELECT * FROM sessions WHERE id = ? FOR UPDATE', [sessionId]) as Array<Record<string, unknown>>;
      const session = sessions[0];
      if (!session) throw new NotFoundException('Session not found.');
      if (session.status === 'ENDED') throw new ConflictException('Session cannot be joined.');
      const principals = await manager.query('SELECT id, user_id FROM principals WHERE id = ? AND user_id = ?', [context.principalId, context.userId]) as unknown[];
      if (!principals.length) throw new ForbiddenException('The operation is not allowed for this access context.');
      if (dto.virtualBackgroundId) {
        const backgrounds = await manager.query('SELECT id FROM virtual_backgrounds WHERE id = ? AND active = 1', [dto.virtualBackgroundId]) as unknown[];
        if (!backgrounds.length) throw new UnprocessableEntityException('The selected virtual background is unavailable.');
      }
      const joined = await manager.query('SELECT COUNT(*) AS count FROM participants WHERE session_id = ? AND status = \'JOINED\'', [sessionId]) as Array<{ count: number }>;
      const limit = session.kind === 'LIVE_STREAM' ? 1000 : 100;
      if (Number(joined[0]?.count ?? 0) >= limit) throw new ConflictException('The session is at capacity.');
      const duplicate = await manager.query('SELECT id FROM participants WHERE session_id = ? AND principal_id = ? AND status = \'JOINED\' LIMIT 1', [sessionId, context.principalId]) as unknown[];
      if (duplicate.length) throw new ConflictException('The participant has already joined this session.');

      const participantId = randomUUID();
      const isHost = session.designated_host_principal_id === context.principalId;
      const role = isHost ? 'HOST' : session.kind === 'LIVE_STREAM' ? 'VIEWER' : 'BROADCASTER';
      const effectiveMic = role !== 'VIEWER' && dto.microphoneEnabled;
      const effectiveCamera = role !== 'VIEWER' && dto.cameraEnabled;
      await manager.query('INSERT INTO participants (id, session_id, principal_id, user_id, display_name, role, status, microphone_enabled, camera_enabled, version) VALUES (?, ?, ?, ?, ?, ?, \'JOINED\', ?, ?, 1)', [participantId, sessionId, context.principalId, context.userId, name, role, effectiveMic, effectiveCamera]);
      await manager.query('INSERT INTO media_preferences (participant_id, microphone_device_id, camera_device_id, speaker_device_id, virtual_background_id) VALUES (?, ?, ?, ?, ?)', [participantId, dto.microphoneDeviceId ?? null, dto.cameraDeviceId ?? null, dto.speakerDeviceId ?? null, dto.virtualBackgroundId ?? null]);
      await manager.query('INSERT INTO view_preferences (participant_id, layout, picture_in_picture) VALUES (?, \'EQUAL_PROMINENCE\', 0)', [participantId]);
      if (isHost) await manager.query('UPDATE sessions SET host_participant_id = ?, status = \'LIVE\', version = version + 1 WHERE id = ?', [participantId, sessionId]);
      else await manager.query('UPDATE sessions SET version = version + 1 WHERE id = ?', [sessionId]);

      const data = { participant: { id: participantId, sessionId, principalId: context.principalId, userId: context.userId, displayName: name, role, status: 'JOINED', microphoneEnabled: effectiveMic, cameraEnabled: effectiveCamera, version: 1 }, session: { ...session, status: isHost ? 'LIVE' : session.status }, stream: null, media: { participantId, microphoneDeviceId: dto.microphoneDeviceId ?? null, cameraDeviceId: dto.cameraDeviceId ?? null, speakerDeviceId: dto.speakerDeviceId ?? null, virtualBackgroundId: dto.virtualBackgroundId ?? null }, view: { participantId, layout: 'EQUAL_PROMINENCE', focusedParticipantId: null, sidePanel: null, pictureInPicture: false } };
      const responseReference = randomUUID();
      const body = { success: true, message: 'Session joined successfully.', data };
      await manager.query('INSERT INTO idempotency_responses (id, status_code, response_body) VALUES (?, 201, ?)', [responseReference, JSON.stringify(body)]);
      await manager.query('INSERT INTO idempotency_records (principal_id, session_id, operation, idempotency_key, payload_hash, response_reference, completed_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(3), DATE_ADD(CURRENT_TIMESTAMP(3), INTERVAL 24 HOUR))', [context.principalId, sessionId, 'SESSION_JOIN', key, payloadHash, responseReference]);
      return body;
    });
  }
}
