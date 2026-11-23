import { Body, Controller, Get, Headers, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { DataSource } from 'typeorm';
import { JoinSessionDto } from './dto/join-session.dto';
import { SessionAuthGuard } from './session-auth.guard';
import { SessionJoinService } from './session-join.service';
import { ParticipantListService } from './participant-list.service';
import { ListParticipantsDto } from './dto/list-participants.dto';

@Controller('/api/v1/sessions')
export class SessionController {
  constructor(
    private readonly joinService: SessionJoinService,
    private readonly participantListService: ParticipantListService,
    private readonly dataSource: DataSource,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  @Post('demo')
  async createDemoSession() {
    const principalId = '11111111-1111-4111-8111-111111111111';
    const sessionId = '11111111-1111-4111-8111-111111111112';
    const userId = 'demo-user-uc02';
    await this.dataSource.transaction(async (manager) => {
      await manager.query('INSERT INTO principals (id, user_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE user_id = VALUES(user_id)', [principalId, userId]);
      await manager.query("INSERT INTO sessions (id, kind, status, designated_host_principal_id) VALUES (?, 'VIDEO_CONFERENCE', 'LOBBY', ?) ON DUPLICATE KEY UPDATE status = 'LOBBY', designated_host_principal_id = VALUES(designated_host_principal_id), host_participant_id = NULL, version = 0", [sessionId, principalId]);
      await manager.query('DELETE FROM participants WHERE session_id = ? AND principal_id = ?', [sessionId, principalId]);
    });
    const accessToken = await this.jwt.signAsync(
      { sub: principalId, userId, sessionId },
      { secret: this.config.getOrThrow<string>('JWT_SECRET') },
    );
    return { success: true, data: { sessionId, accessToken } };
  }

  @Get(':sessionId/participants')
  @UseGuards(SessionAuthGuard)
  async listParticipants(@Param('sessionId') sessionId: string, @Query() query: ListParticipantsDto, @Req() request: Request) {
    const data = await this.participantListService.list(sessionId, query, request.sessionPrincipal!);
    return { success: true, message: 'Participants loaded', data };
  }

  @Post(':sessionId/participants')
  @UseGuards(SessionAuthGuard)
  async join(@Param('sessionId') sessionId: string, @Headers('idempotency-key') idempotencyKey: string | undefined, @Body() dto: JoinSessionDto, @Req() request: Request) {
    const data = await this.joinService.join(sessionId, idempotencyKey, dto, request.sessionPrincipal!);
    return { success: true, message: 'Session joined', data };
  }
}
