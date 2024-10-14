import { Expose } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateGameDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  gameName: string;

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  @IsIn([4, 6, 8, 10])
  maxPlayers: number;

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  @IsIn([2, , 4, 5, 6, 7, 8, 9, 10])
  rounds: number;

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  @IsIn([10, 30, 45, 60, 75, 90, 105, 120])
  time: number;
}
