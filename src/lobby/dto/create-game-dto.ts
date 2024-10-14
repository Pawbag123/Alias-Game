import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateGameDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  gameName: string;
}
