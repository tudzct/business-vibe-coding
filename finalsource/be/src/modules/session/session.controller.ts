import { Body, Controller, Get, Headers, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JoinSessionDto } from './dto/join-session.dto';
import { SessionAuthGuard } from './session-auth.guard';
import { SessionJoinService } from './session-join.service';
import { ParticipantListService } from './participant-list.service';
import { ListParticipantsDto } from './dto/list-participants.dto';

@Controller('/api/v1/sessions')
export class SessionController {
  constructor(private readonly joinService: SessionJoinService, private readonly participantListService: ParticipantListService) {}

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
