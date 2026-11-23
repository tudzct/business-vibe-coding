import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, ServiceUnavailableException, UnprocessableEntityException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createHash } from 'node:crypto';
import { ReactionCode, SendReactionDto } from './dto/send-reaction.dto';
import type { SessionPrincipal } from './session-auth.guard';

type ReactionEvent = { id: string; sessionId: string; participantId: string; reaction: ReactionCode; createdAt: Date; sequence: number };

@Injectable()
export class ReactionService {
  constructor(private readonly dataSource: DataSource) {}

  async send(sessionId: string, idempotencyKey: string | undefined, dto: SendReactionDto, principal: SessionPrincipal): Promise<{ reaction: ReactionEvent }> {
    this.validateSessionId(sessionId);
    if (principal.sessionId !== sessionId) throw new ForbiddenException('Session access denied');
    const key = idempotencyKey?.trim();
    if (!key) throw new UnprocessableEntityException('Idempotency-Key is required');
    const payloadHash = createHash('sha256').update(JSON.stringify({ reaction: dto.reaction })).digest('hex');
    try {
      return await this.dataSource.transaction('SERIALIZABLE', async (manager) => {
        const existing = await manager.query('SELECT r.payload_hash AS payloadHash, p.response_body AS responseBody FROM idempotency_records r JOIN idempotency_responses p ON p.id = r.response_reference WHERE r.principal_id = ? AND r.session_id = ? AND r.operation = ? AND r.idempotency_key = ? FOR UPDATE', [principal.principalId, sessionId, 'REACTION_CREATE', key]) as Array<{ payloadHash: string; responseBody: string }>;
        if (existing[0]) {
          if (existing[0].payloadHash !== payloadHash) throw new ConflictException('Idempotency key was already used with a different reaction');
          return JSON.parse(existing[0].responseBody) as { reaction: ReactionEvent };
        }
        const sessions = await manager.query('SELECT id, status, version FROM sessions WHERE id = ? FOR UPDATE', [sessionId]) as Array<{ id: string; status: string; version: number }>;
        const session = sessions[0];
        if (!session) throw new NotFoundException('Session not found');
        if (session.status === 'ENDED') throw new UnprocessableEntityException('Session is no longer active');
        const participants = await manager.query("SELECT id FROM participants WHERE session_id = ? AND principal_id = ? AND status = 'JOINED'", [sessionId, principal.principalId]) as Array<{ id: string }>;
        const participant = participants[0];
        if (!participant) throw new ForbiddenException('Session access denied');
        const reaction: ReactionEvent = { id: crypto.randomUUID(), sessionId, participantId: participant.id, reaction: dto.reaction, createdAt: new Date(), sequence: Number(session.version) + 1 };
        await manager.query('INSERT INTO reaction_events (id, session_id, participant_id, reaction, created_at, sequence) VALUES (?, ?, ?, ?, ?, ?)', [reaction.id, sessionId, participant.id, reaction.reaction, reaction.createdAt, reaction.sequence]);
        await manager.query('UPDATE sessions SET version = ? WHERE id = ?', [reaction.sequence, sessionId]);
        const response = { reaction };
        const responseId = crypto.randomUUID();
        await manager.query('INSERT INTO idempotency_responses (id, status_code, response_body) VALUES (?, ?, ?)', [responseId, 201, JSON.stringify(response)]);
        await manager.query('INSERT INTO idempotency_records (principal_id, session_id, operation, idempotency_key, payload_hash, response_reference, completed_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(3), DATE_ADD(CURRENT_TIMESTAMP(3), INTERVAL 24 HOUR))', [principal.principalId, sessionId, 'REACTION_CREATE', key, payloadHash, responseId]);
        return response;
      });
    } catch (error: unknown) {
      if (error instanceof ConflictException || error instanceof ForbiddenException || error instanceof NotFoundException || error instanceof UnprocessableEntityException) throw error;
      throw new ServiceUnavailableException('Reaction could not be sent.');
    }
  }

  private validateSessionId(sessionId: string): void { if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)) throw new BadRequestException('Session identifier is invalid'); }
}
