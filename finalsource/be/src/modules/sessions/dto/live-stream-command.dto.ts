import { Type } from 'class-transformer';
import { IsIn, IsInt, Min } from 'class-validator';

export class LiveStreamCommandDto {
  @IsIn(['START', 'STOP'])
  readonly action!: 'START' | 'STOP';

  @Type(() => Number)
  @IsInt()
  @Min(0)
  readonly expectedVersion!: number;
}
