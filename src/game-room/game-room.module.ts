import { Module } from '@nestjs/common';

import { GameStateModule } from 'src/shared/game-state.module';
import { GameRoomService } from './game-room.service';
import { GameMechanicsService } from './game-mechanics.service';

@Module({
  imports: [GameStateModule],
  providers: [GameRoomService, GameMechanicsService],
})
export class GameRoomModule {}
