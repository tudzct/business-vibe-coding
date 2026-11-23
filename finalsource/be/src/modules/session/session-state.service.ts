import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { SessionPrincipal } from './session-auth.guard';

@Injectable()
export class SessionStateService {
  constructor(private readonly dataSource: DataSource) {}

  async readState(sessionId: string, reactionCursor: string | undefined, principal: SessionPrincipal) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)) {
      throw new BadRequestException('Session identifier is invalid');
    }
    if (principal.sessionId !== sessionId) {
      throw new ForbiddenException('Session access denied');
    }

    const sessionRows = await this.dataSource.query(
      'SELECT id, kind, status, designated_host_principal_id AS designatedHostPrincipalId, host_participant_id AS hostParticipantId, version FROM sessions WHERE id = ?',
      [sessionId],
    );
    const session = sessionRows[0];
    if (!session) throw new NotFoundException('Session not found');

    const participantRows = await this.dataSource.query(
      'SELECT id, session_id AS sessionId, principal_id AS principalId, user_id AS userId, display_name AS displayName, role, status, microphone_enabled AS microphoneEnabled, camera_enabled AS cameraEnabled, joined_at AS joinedAt FROM participants WHERE session_id = ? AND principal_id = ?',
      [sessionId, principal.principalId],
    );
    const selfParticipant = participantRows[0];
    if (!selfParticipant || (selfParticipant.status !== 'JOINED' && session.status !== 'ENDED')) {
      throw new ForbiddenException('Session access denied');
    }

    const mediaRows = await this.dataSource.query(
      'SELECT participant_id AS participantId, microphone_device_id AS microphoneDeviceId, camera_device_id AS cameraDeviceId, speaker_device_id AS speakerDeviceId, virtual_background_id AS virtualBackgroundId FROM media_preferences WHERE participant_id = ?',
      [selfParticipant.id],
    );
    const viewRows = await this.dataSource.query(
      'SELECT participant_id AS participantId, layout, focused_participant_id AS focusedParticipantId, side_panel AS sidePanel, picture_in_picture AS pictureInPicture FROM view_preferences WHERE participant_id = ?',
      [selfParticipant.id],
    );

    const lastSeq = reactionCursor ? Number(reactionCursor) || 0 : 0;
    const reactions = await this.dataSource.query(
      'SELECT id, session_id AS sessionId, participant_id AS participantId, emoji, sequence, created_at AS createdAt FROM reaction_events WHERE session_id = ? AND sequence > ? ORDER BY sequence ASC LIMIT 50',
      [sessionId, lastSeq],
    ).catch(() => []);

    const nextReactionCursor = reactions.length > 0 ? String(reactions[reactions.length - 1].sequence) : (reactionCursor ?? null);

    return {
      session,
      selfParticipant,
      stream: null,
      recording: null,
      share: null,
      media: mediaRows[0] ?? null,
      view: viewRows[0] ?? null,
      stageRequests: [],
      reactions,
      nextReactionCursor,
    };
  }
}
