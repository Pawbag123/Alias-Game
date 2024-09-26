import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(6, { message: 'Username must be at least 6 characters long' })
  @Matches(/^[a-zA-Z0-9]+$/, { message: 'Username can only contain letters and numbers' }) 
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, { 
    message: 'Password must be at least 6 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.' 
  })
  password: string;
}
