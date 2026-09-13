import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsDefined()
  @IsString()
  fullName!: string;

  @ApiProperty()
  @IsDefined()
  @IsString()
  email!: string;

  @ApiProperty({ writeOnly: true })
  @IsDefined()
  @IsString()
  password!: string;

  @ApiProperty({ writeOnly: true })
  @IsDefined()
  @IsString()
  confirmPassword!: string;
}
