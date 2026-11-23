import { BadRequestException, ForbiddenException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { DataSource } from 'typeorm';
import type { ListParticipantsDto } from './dto/list-participants.dto';
import type { SessionPrincipal } from './session-auth.guard';

type Cursor = { collection: 'participants'; sessionId: string; joinedAt: string; id: string };
type ParticipantRow = { id: string; sessionId: string; principalId: string; userId: string; displayName: string; role: string; status: string; joinedAt: Date };

@Injectable()
export class ParticipantListService {
  constructor(private readonly dataSource: DataSource, private readonly config: ConfigService) {}

  async list(sessionId: string, query: ListParticipantsDto, principal: SessionPrincipal): Promise<{ items: ParticipantRow[]; nextCursor: string | null }> {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)) throw new BadRequestException('Session identifier is invalid');
    if (principal.sessionId !== sessionId) throw new ForbiddenException('Session access denied');
    const sessionRows = await this.dataSource.query('SELECT id, status FROM sessions WHERE id = ?', [sessionId]);
    const session = sessionRows[0] as { id: string; status: string } | undefined;
    if (!session) throw new NotFoundException('Session not found');
    if (session.status === 'ENDED') throw new BadRequestException('Session is no longer active');

    const membershipRows = await this.dataSource.query("SELECT id FROM participants WHERE session_id = ? AND principal_id = ? AND status = 'JOINED'", [sessionId, principal.principalId]);
    if (!membershipRows[0]) throw new ForbiddenException('Session access denied');
    const cursor = this.decodeCursor(query.cursor, sessionId);
    const params: Array<string | number> = [sessionId, query.pageSize + 1];
    let paging = '';
    if (cursor) {
      paging = ' AND (joined_at > ? OR (joined_at = ? AND id > ?))';
      params.splice(1, 0, cursor.joinedAt, cursor.joinedAt, cursor.id);
    }
    try {
      const rows = (await this.dataSource.query(`SELECT id, session_id AS sessionId, principal_id AS principalId, user_id AS userId, display_name AS displayName, role, status, joined_at AS joinedAt FROM participants WHERE session_id = ? AND status = 'JOINED'${paging} ORDER BY joined_at ASC, id ASC LIMIT ?`, params)) as ParticipantRow[];
      const hasNext = rows.length > query.pageSize;
      const items = rows.slice(0, query.pageSize);
      const last = items.at(-1);
      return { items, nextCursor: hasNext && last ? this.encodeCursor({ collection: 'participants', sessionId, joinedAt: new Date(last.joinedAt).toISOString(), id: last.id }) : null };
    } catch {
      throw new ServiceUnavailableException('Participant list unavailable');
    }
  }

  private encodeCursor(cursor: Cursor): string {
    const payload = Buffer.from(JSON.stringify(cursor)).toString('base64url');
    const signature = this.sign(payload);
    return `${payload}.${signature}`;
  }

  private decodeCursor(value: string | undefined, sessionId: string): Cursor | undefined {
    if (!value) return undefined;
    const [payload, signature] = value.split('.');
    if (!payload || !signature || !/^[A-Za-z0-9_-]+$/.test(payload) || !/^[A-Za-z0-9_-]+$/.test(signature)) throw new BadRequestException('Cursor is invalid');
    const expected = this.sign(payload);
    const valid = Buffer.byteLength(signature) === Buffer.byteLength(expected) && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    if (!valid) throw new BadRequestException('Cursor is invalid');
    try {
      const cursor = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Partial<Cursor>;
      if (cursor.collection !== 'participants' || cursor.sessionId !== sessionId || typeof cursor.joinedAt !== 'string' || typeof cursor.id !== 'string') throw new Error('Invalid cursor');
      return cursor as Cursor;
    } catch {
      throw new BadRequestException('Cursor is invalid');
    }
  }

  private sign(payload: string): string {
    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret) throw new ServiceUnavailableException('Participant list unavailable');
    return createHmac('sha256', secret).update(payload).digest('base64url');
  }
}
