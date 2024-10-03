import { Module } from '@nestjs/common';
import { GameRoomService } from './game-room.service';
import { LobbyService } from 'src/lobby/lobby.service';
import { GameStateModule } from 'src/shared/game-state.module';
import { GameMechanicsService } from './game-mechanics.service';

@Module({
  imports: [GameStateModule],
  providers: [GameRoomService, GameMechanicsService],
})
export class GameRoomModule {}
