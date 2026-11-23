import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { JoinSessionDto } from './dto/join-session.dto';
import type { SessionPrincipal } from './session-auth.guard';

@Injectable()
export class SessionJoinService {
  constructor(private readonly dataSource: DataSource) {}

  async join(sessionId: string, idempotencyKey: string | undefined, dto: JoinSessionDto, principal: SessionPrincipal) {
    if (!idempotencyKey?.trim()) throw new UnprocessableEntityException('Idempotency-Key is required');
    if (principal.sessionId !== sessionId) throw new ForbiddenException('Session access denied');
    const name = dto.displayName.trim();
    if (!name || name.length > 50) throw new UnprocessableEntityException('Display name is invalid');
    return this.dataSource.transaction('SERIALIZABLE', async (manager) => {
      const sessionRows = await manager.query('SELECT id, kind, status, designated_host_principal_id AS designatedHostPrincipalId, host_participant_id AS hostParticipantId, version FROM sessions WHERE id = ? FOR UPDATE', [sessionId]);
      const session = sessionRows[0] as { id: string; kind: string; status: string; designatedHostPrincipalId: string; hostParticipantId: string | null; version: number } | undefined;
      if (!session) throw new NotFoundException('Session not found');
      if (session.status === 'ENDED') throw new ConflictException('Session cannot be joined');
      const principalRows = await manager.query('SELECT id, user_id AS userId FROM principals WHERE id = ? AND user_id = ?', [principal.principalId, principal.userId]);
      if (!principalRows[0]) throw new ForbiddenException('Session access denied');
      const existing = await manager.query("SELECT id FROM participants WHERE session_id = ? AND principal_id = ? AND status = 'JOINED'", [sessionId, principal.principalId]);
      if (existing[0]) throw new ConflictException('Participant already joined');
      const joinedRows = await manager.query("SELECT COUNT(*) AS count FROM participants WHERE session_id = ? AND status = 'JOINED'", [sessionId]);
      const count = Number(joinedRows[0]?.count ?? 0);
      const limit = session.kind === 'LIVE_STREAM' ? 1000 : 100;
      if (count >= limit) throw new ConflictException('Session capacity reached');
      const participantId = crypto.randomUUID();
      const role = principal.principalId === session.designatedHostPrincipalId ? 'HOST' : session.kind === 'LIVE_STREAM' ? 'VIEWER' : 'BROADCASTER';
      const microphoneEnabled = role === 'VIEWER' ? false : dto.microphoneEnabled;
      const cameraEnabled = role === 'VIEWER' ? false : dto.cameraEnabled;
      await manager.query("INSERT INTO participants (id, session_id, principal_id, user_id, display_name, role, status, microphone_enabled, camera_enabled, version) VALUES (?, ?, ?, ?, ?, ?, 'JOINED', ?, ?, 1)", [participantId, sessionId, principal.principalId, principal.userId, name, role, microphoneEnabled, cameraEnabled]);
      await manager.query('INSERT INTO media_preferences (participant_id, microphone_device_id, camera_device_id, speaker_device_id, virtual_background_id) VALUES (?, ?, ?, ?, ?)', [participantId, dto.microphoneDeviceId ?? null, dto.cameraDeviceId ?? null, dto.speakerDeviceId ?? null, dto.virtualBackgroundId ?? null]);
      await manager.query("INSERT INTO view_preferences (participant_id, layout, focused_participant_id, side_panel, picture_in_picture) VALUES (?, 'EQUAL_PROMINENCE', NULL, NULL, 0)", [participantId]);
      if (role === 'HOST') await manager.query("UPDATE sessions SET host_participant_id = ?, status = 'LIVE', version = version + 1 WHERE id = ?", [participantId, sessionId]);
      else await manager.query('UPDATE sessions SET version = version + 1 WHERE id = ?', [sessionId]);
      const participant = { id: participantId, sessionId, principalId: principal.principalId, userId: principal.userId, displayName: name, role, status: 'JOINED', microphoneEnabled, cameraEnabled, version: 1 };
      const media = { participantId, microphoneDeviceId: dto.microphoneDeviceId ?? null, cameraDeviceId: dto.cameraDeviceId ?? null, speakerDeviceId: dto.speakerDeviceId ?? null, virtualBackgroundId: dto.virtualBackgroundId ?? null };
      const view = { participantId, layout: 'EQUAL_PROMINENCE', focusedParticipantId: null, sidePanel: null, pictureInPicture: false };
      return { participant, session: { ...session, status: role === 'HOST' ? 'LIVE' : session.status, version: session.version + 1 }, stream: null, media, view };
    });
  }
}
