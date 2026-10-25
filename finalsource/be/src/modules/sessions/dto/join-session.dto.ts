import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class JoinSessionDto {
  @IsString()
  @Length(1, 50)
  readonly displayName!: string;

  @Type(() => Boolean)
  @IsBoolean()
  readonly microphoneEnabled!: boolean;

  @Type(() => Boolean)
  @IsBoolean()
  readonly cameraEnabled!: boolean;

  @IsOptional()
  @IsString()
  readonly microphoneDeviceId?: string | null;

  @IsOptional()
  @IsString()
  readonly cameraDeviceId?: string | null;

  @IsOptional()
  @IsString()
  readonly speakerDeviceId?: string | null;

  @IsOptional()
  @IsUUID()
  readonly virtualBackgroundId?: string | null;
}
