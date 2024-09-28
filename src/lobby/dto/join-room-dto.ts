import { IsString, IsNotEmpty } from 'class-validator';

export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  roomId: string;
}
