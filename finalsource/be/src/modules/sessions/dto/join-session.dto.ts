import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class JoinSessionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  displayName!: string;

  @IsBoolean()
  microphoneEnabled!: boolean;

  @IsBoolean()
  cameraEnabled!: boolean;

  @IsOptional()
  @IsString()
  microphoneDeviceId: string | null = null;

  @IsOptional()
  @IsString()
  cameraDeviceId: string | null = null;

  @IsOptional()
  @IsString()
  speakerDeviceId: string | null = null;

  @IsOptional()
  @IsUUID()
  virtualBackgroundId: string | null = null;
}
