import { ApiProperty } from '@nestjs/swagger';

export class RegisteredUserDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  email!: string;
}

export class RegisterDataDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ type: RegisteredUserDto })
  user!: RegisteredUserDto;
}

export class RegisterResponseDto {
  @ApiProperty({ example: 'Registration successful' })
  message!: string;

  @ApiProperty({ type: RegisterDataDto })
  data!: RegisterDataDto;
}
