import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, ServiceUnavailableException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { DataSource } from 'typeorm';
import type { ListChatMessagesDto } from './dto/list-chat-messages.dto';
import type { SendChatMessageDto } from './dto/send-chat-message.dto';
import type { SessionPrincipal } from './session-auth.guard';

type ChatMessage = { id: string; sessionId: string; senderParticipantId: string; body: string; sentAt: Date; sequence: number };
type MessageCursor = { collection: 'messages'; sessionId: string; sequence: number };

@Injectable()
export class ChatMessageService {
  constructor(private readonly dataSource: DataSource, private readonly config: ConfigService) {}

  async list(sessionId: string, query: ListChatMessagesDto, principal: SessionPrincipal): Promise<{ items: ChatMessage[]; nextCursor: string }> {
    this.validateSessionId(sessionId);
    this.requireSessionPrincipal(sessionId, principal);
    const cursor = this.decodeCursor(query.cursor, sessionId);
    try {
      const rows = await this.dataSource.query('SELECT id, session_id AS sessionId, sender_participant_id AS senderParticipantId, body, sent_at AS sentAt, sequence FROM chat_messages WHERE session_id = ? AND sequence > ? ORDER BY sequence ASC LIMIT ?', [sessionId, cursor?.sequence ?? 0, query.pageSize + 1]) as ChatMessage[];
      const items = rows.slice(0, query.pageSize);
      const last = items.at(-1);
      return { items, nextCursor: last ? this.encodeCursor({ collection: 'messages', sessionId, sequence: Number(last.sequence) }) : (query.cursor ?? '') };
    } catch {
      throw new ServiceUnavailableException('Chat history could not be loaded.');
    }
  }

  async send(sessionId: string, idempotencyKey: string | undefined, dto: SendChatMessageDto, principal: SessionPrincipal): Promise<{ message: ChatMessage }> {
    this.validateSessionId(sessionId);
    this.requireSessionPrincipal(sessionId, principal);
    if (!idempotencyKey?.trim()) throw new UnprocessableEntityException('Idempotency-Key is required');
    const body = dto.body.trim();
    if (!body || body.length > 1000) throw new UnprocessableEntityException('Message body is invalid');
    const payloadHash = createHash('sha256').update(JSON.stringify({ body })).digest('hex');
    try {
      return await this.dataSource.transaction('SERIALIZABLE', async (manager) => {
        const existing = await manager.query('SELECT r.payload_hash AS payloadHash, p.response_body AS responseBody FROM idempotency_records r JOIN idempotency_responses p ON p.id = r.response_reference WHERE r.principal_id = ? AND r.session_id = ? AND r.operation = ? AND r.idempotency_key = ? FOR UPDATE', [principal.principalId, sessionId, 'CHAT_MESSAGE_CREATE', idempotencyKey.trim()]);
        if (existing[0]) {
          if (existing[0].payloadHash !== payloadHash) throw new ConflictException('Idempotency key was already used with a different message');
          return JSON.parse(existing[0].responseBody) as { message: ChatMessage };
        }
        const sessions = await manager.query('SELECT id, status, version FROM sessions WHERE id = ? FOR UPDATE', [sessionId]);
        const session = sessions[0] as { id: string; status: string; version: number } | undefined;
        if (!session) throw new NotFoundException('Session not found');
        if (session.status === 'ENDED') throw new UnprocessableEntityException('Session is no longer active');
        const participants = await manager.query("SELECT id FROM participants WHERE session_id = ? AND principal_id = ? AND status = 'JOINED'", [sessionId, principal.principalId]);
        const participant = participants[0] as { id: string } | undefined;
        if (!participant) throw new ForbiddenException('Session access denied');
        const message = { id: crypto.randomUUID(), sessionId, senderParticipantId: participant.id, body, sentAt: new Date(), sequence: Number(session.version) + 1 } satisfies ChatMessage;
        await manager.query('INSERT INTO chat_messages (id, session_id, sender_participant_id, body, sent_at, sequence) VALUES (?, ?, ?, ?, ?, ?)', [message.id, sessionId, participant.id, body, message.sentAt, message.sequence]);
        await manager.query('UPDATE sessions SET version = ? WHERE id = ?', [message.sequence, sessionId]);
        const response = { message };
        const responseId = crypto.randomUUID();
        await manager.query('INSERT INTO idempotency_responses (id, status_code, response_body) VALUES (?, ?, ?)', [responseId, 201, JSON.stringify(response)]);
        await manager.query('INSERT INTO idempotency_records (principal_id, session_id, operation, idempotency_key, payload_hash, response_reference, completed_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(3), DATE_ADD(CURRENT_TIMESTAMP(3), INTERVAL 24 HOUR))', [principal.principalId, sessionId, 'CHAT_MESSAGE_CREATE', idempotencyKey.trim(), payloadHash, responseId]);
        return response;
      });
    } catch (error: unknown) {
      if (error instanceof ConflictException || error instanceof ForbiddenException || error instanceof NotFoundException || error instanceof UnprocessableEntityException) throw error;
      throw new ServiceUnavailableException('Chat message could not be sent.');
    }
  }

  private validateSessionId(sessionId: string): void { if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)) throw new BadRequestException('Session identifier is invalid'); }
  private requireSessionPrincipal(sessionId: string, principal: SessionPrincipal): void { if (principal.sessionId !== sessionId) throw new ForbiddenException('Session access denied'); }
  private encodeCursor(cursor: MessageCursor): string { const payload = Buffer.from(JSON.stringify(cursor)).toString('base64url'); return `${payload}.${this.sign(payload)}`; }
  private decodeCursor(value: string | undefined, sessionId: string): MessageCursor | undefined {
    if (!value) return undefined;
    const [payload, signature] = value.split('.');
    if (!payload || !signature) throw new BadRequestException('Cursor is invalid');
    const expected = this.sign(payload);
    if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new BadRequestException('Cursor is invalid');
    try { const cursor = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as MessageCursor; if (cursor.collection !== 'messages' || cursor.sessionId !== sessionId || !Number.isInteger(cursor.sequence)) throw new Error(); return cursor; } catch { throw new BadRequestException('Cursor is invalid'); }
  }
  private sign(payload: string): string { const secret = this.config.get<string>('JWT_SECRET'); if (!secret) throw new ServiceUnavailableException('Chat history could not be loaded.'); return createHmac('sha256', secret).update(payload).digest('base64url'); }
}
