import { IsString, IsNotEmpty } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  roomName: string;
}
