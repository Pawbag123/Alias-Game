import { Module } from '@nestjs/common';
import { GameRoomService } from './game-room.service';

@Module({
  providers: [GameRoomService],
})
export class GameRoomModule {}
