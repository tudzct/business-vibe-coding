import { Body, Controller, Headers, Param, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { JoinSessionDto } from './dto/join-session.dto';
import { SessionJoinService } from './session-join.service';

type RequestWithUser = Request & { user?: { principalId?: string; userId?: string; sessionId?: string } };

@Controller('api/v1/sessions')
export class SessionsController {
  constructor(private readonly sessionJoinService: SessionJoinService) {}

  @Post(':sessionId/participants')
  join(@Param('sessionId') sessionId: string, @Body() dto: JoinSessionDto, @Headers('idempotency-key') idempotencyKey: string | undefined, @Req() request: RequestWithUser) {
    return this.sessionJoinService.join(sessionId, dto, idempotencyKey, request.user ?? {});
  }
}
