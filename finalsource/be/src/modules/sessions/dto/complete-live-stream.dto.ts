import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsString, Min } from 'class-validator';
export class CompleteLiveStreamDto { @IsString() readonly resourceId!: string; @Type(() => Number) @IsInt() @Min(0) readonly expectedVersion!: number; @Type(() => Boolean) @IsBoolean() readonly succeeded!: boolean; }
