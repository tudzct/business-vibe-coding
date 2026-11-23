import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListParticipantsDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value : undefined))
  readonly cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  readonly pageSize = 50;
}
