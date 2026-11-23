import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { SessionPrincipal } from './session-auth.guard';
import { LiveStreamAction, type LiveStreamCommandDto } from './dto/live-stream-command.dto';

@Injectable()
export class LiveStreamService {
  constructor(private readonly dataSource: DataSource) {}

  async control(sessionId: string, idempotencyKey: string | undefined, command: LiveStreamCommandDto, principal: SessionPrincipal) {
    if (!idempotencyKey?.trim()) throw new UnprocessableEntityException('Idempotency-Key is required');
    if (principal.sessionId !== sessionId) throw new ForbiddenException('Session access denied');
    if (command.action !== LiveStreamAction.START) throw new UnprocessableEntityException('Stream action is not supported');

    return this.dataSource.transaction('SERIALIZABLE', async (manager) => {
      const sessionRows = await manager.query(
        'SELECT id, kind, status, version FROM sessions WHERE id = ? FOR UPDATE',
        [sessionId],
      );
      const session = sessionRows[0] as { id: string; kind: string; status: string; version: number } | undefined;
      if (!session) throw new NotFoundException('Session not found');
      if (session.kind !== 'LIVE_STREAM' || session.status !== 'LIVE') throw new ConflictException('Session is not ready for live streaming');

      const participantRows = await manager.query(
        "SELECT id FROM participants WHERE id = ? AND session_id = ? AND principal_id = ? AND role = 'HOST' AND status = 'JOINED'",
        [principal.participantId ?? '', sessionId, principal.principalId],
      );
      const hostRows = participantRows.length > 0 ? participantRows : await manager.query(
        "SELECT id FROM participants WHERE session_id = ? AND principal_id = ? AND role = 'HOST' AND status = 'JOINED'",
        [sessionId, principal.principalId],
      );
      if (!hostRows[0]) throw new ForbiddenException('Live stream control denied');

      const streamRows = await manager.query(
        'SELECT id, session_id AS sessionId, status, version, started_at AS startedAt, ended_at AS endedAt FROM live_streams WHERE session_id = ? FOR UPDATE',
        [sessionId],
      );
      const stream = streamRows[0] as { id: string; sessionId: string; status: string; version: number; startedAt: Date | null; endedAt: Date | null } | undefined;
      if (!stream) throw new NotFoundException('Live stream not found');
      if (stream.status !== 'READY' || command.expectedVersion !== stream.version) throw new ConflictException('Live stream version conflict');

      await manager.query(
        "UPDATE live_streams SET status = 'STARTING', version = version + 1, ended_at = NULL WHERE id = ? AND status = 'READY' AND version = ?",
        [stream.id, command.expectedVersion],
      );
      return {
        stream: { ...stream, status: 'STARTING', version: stream.version + 1, endedAt: null },
        session,
      };
    });
  }
}
