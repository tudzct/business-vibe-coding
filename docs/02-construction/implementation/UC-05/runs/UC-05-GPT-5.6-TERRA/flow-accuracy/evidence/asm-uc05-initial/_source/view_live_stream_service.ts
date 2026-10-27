  async viewLiveStream(
    sessionId: string,
    acceptHeader: string | undefined,
    principal: SessionPrincipal,
  ): Promise<SuccessEnvelope> {
    if (!acceptHeader?.split(',').some((value) => value.trim().startsWith('application/json'))) {
      throw new BadRequestException('Accept: application/json is required');
    }
    if (principal.sessionId !== sessionId) {
      throw new ForbiddenException('The requested session is not authorized');
    }

    try {
      const manager = this.dataSource.manager;
      const session = await this.findSession(manager, sessionId, false);
      if (session.kind !== 'LIVE_STREAM') {
        throw new NotFoundException('The live stream is unavailable');
      }

      const participant = await this.findActiveParticipant(manager, sessionId, principal.principalId);
      if (!participant) {
        throw new NotFoundException('The participant is unavailable');
      }
      if (participant.role !== 'VIEWER' && participant.role !== 'STAGE_PARTICIPANT') {
        throw new ForbiddenException('The caller is not authorized to view this live stream');
      }

      const stream = firstRow(await manager.query(
        'SELECT status, version FROM live_streams WHERE session_id = ?',
        [sessionId],
      ));
      if (!stream || typeof stream.status !== 'string' || typeof stream.version !== 'number') {
        throw new NotFoundException('The live stream is unavailable');
      }

      return {
        success: true,
        message: 'Live stream view loaded',
        data: {
          sessionId: session.id,
          participantId: participant.id,
          viewerRole: participant.role,
          streamStatus: stream.status,
          streamVersion: stream.version,
          sessionVersion: session.version,
        },
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      throw new ServiceUnavailableException('The session service is temporarily unavailable');
    }
  }