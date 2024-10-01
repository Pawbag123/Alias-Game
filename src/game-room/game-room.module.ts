import { Module } from '@nestjs/common';
import { GameRoomService } from './game-room.service';
import { LobbyService } from 'src/lobby/lobby.service';

@Module({
  providers: [GameRoomService, LobbyService],
})
export class GameRoomModule {}
