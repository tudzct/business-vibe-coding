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
