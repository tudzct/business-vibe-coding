import { IsEnum, IsInt } from 'class-validator';

export enum LiveStreamAction {
  START = 'START',
  STOP = 'STOP',
}

export class LiveStreamCommandDto {
  @IsEnum(LiveStreamAction)
  readonly action!: LiveStreamAction;

  @IsInt()
  readonly expectedVersion!: number;
}
