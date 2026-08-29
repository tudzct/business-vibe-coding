export class RegisteredUserDto {
  readonly id!: number;
  readonly fullName!: string;
  readonly email!: string;
}

export class RegisterDataDto {
  readonly accessToken!: string;
  readonly user!: RegisteredUserDto;
}

export class RegisterResponseDto {
  readonly success!: true;
  readonly message!: string;
  readonly data!: RegisterDataDto;
}
