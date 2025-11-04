import { IsString, IsEmail, MinLength, Matches, IsEnum } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class SignupDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @Matches(/^\d{10}$/, { message: 'Phone number must be 10 digits' })
  phoneNumber: string;

  @IsEnum(UserRole, { message: 'role must be editor or viewer' })
  role: UserRole;
}