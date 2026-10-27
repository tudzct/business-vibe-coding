// sessions.service.ts Lines 295-307
        } else if (command.action === 'STOP') {
          if (stream.status !== 'LIVE' && stream.status !== 'STARTING') {
            throw new UnprocessableEntityException('The stream cannot be stopped in its current state');
          }
          await manager.query(
            'UPDATE live_streams SET status = \'ENDED\', version = version + 1, ended_at = UTC_TIMESTAMP(3) WHERE id = ?',
            [stream.id],
          );
          await manager.query(
            'UPDATE sessions SET version = version + 1 WHERE id = ?',
            [sessionId],
          );
        }
