import { IsEmail, IsString } from 'class-validator';

export class UpdateAuthDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}