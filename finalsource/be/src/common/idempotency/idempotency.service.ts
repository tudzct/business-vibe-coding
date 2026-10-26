import { ConflictException, Injectable } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import type { EntityManager } from 'typeorm';

export interface SuccessEnvelope {
  readonly success: true;
  readonly message: string;
  readonly data: Record<string, unknown>;
}

type Row = Record<string, unknown>;

function firstRow(rows: unknown): Row | undefined {
  return Array.isArray(rows) && rows.length > 0 && typeof rows[0] === 'object' && rows[0] !== null
    ? (rows[0] as Row)
    : undefined;
}

function parseStoredResponse(value: unknown): SuccessEnvelope {
  if (typeof value === 'string') {
    return parseStoredResponse(JSON.parse(value) as unknown);
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    (value as Record<string, unknown>).success === true &&
    typeof (value as Record<string, unknown>).message === 'string' &&
    typeof (value as Record<string, unknown>).data === 'object' &&
    (value as Record<string, unknown>).data !== null
  ) {
    const record = value as Record<string, unknown>;
    return {
      success: true,
      message: record.message as string,
      data: record.data as Record<string, unknown>,
    };
  }
  throw new ConflictException('The previous command response is unavailable');
}

@Injectable()
export class IdempotencyService {
  async runWithIdempotency(
    manager: EntityManager,
    principalId: string,
    sessionId: string,
    operation: string,
    idempotencyKey: string,
    payload: Record<string, unknown>,
    statusCode: number,
    executeFn: () => Promise<SuccessEnvelope>,
  ): Promise<SuccessEnvelope> {
    const payloadHash = createHash('sha256').update(JSON.stringify(payload)).digest('hex');

    const existing = firstRow(
      await manager.query(
        'SELECT payload_hash, response_reference FROM idempotency_records WHERE principal_id = ? AND session_id = ? AND operation = ? AND idempotency_key = ? FOR UPDATE',
        [principalId, sessionId, operation, idempotencyKey],
      ),
    );

    if (existing) {
      if (existing.payload_hash !== payloadHash) {
        throw new ConflictException('Idempotency-Key was already used for a different command');
      }
      const replay = firstRow(
        await manager.query(
          'SELECT response_body FROM idempotency_responses WHERE id = ?',
          [existing.response_reference],
        ),
      );
      if (!replay) {
        throw new ConflictException('The previous command response is unavailable');
      }
      return parseStoredResponse(replay.response_body);
    }

    const response = await executeFn();
    const responseId = randomUUID();

    await manager.query(
      'INSERT INTO idempotency_responses (id, status_code, response_body) VALUES (?, ?, ?)',
      [responseId, statusCode, JSON.stringify(response)],
    );

    await manager.query(
      'INSERT INTO idempotency_records (principal_id, session_id, operation, idempotency_key, payload_hash, response_reference, completed_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(3), DATE_ADD(UTC_TIMESTAMP(3), INTERVAL 24 HOUR))',
      [principalId, sessionId, operation, idempotencyKey, payloadHash, responseId],
    );

    return response;
  }
}
