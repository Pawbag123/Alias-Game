import { Module } from '@nestjs/common';

import { GameStateModule } from 'src/game-state/game-state.module';
import { GameRoomService } from './game-room.service';
import { GameMechanicsService } from './game-mechanics.service';
import { GameRoomGateway } from './game-room.gateway';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [GameStateModule, ChatModule],
  providers: [GameRoomService, GameMechanicsService, GameRoomGateway],
  exports: [GameRoomService],
})
export class GameRoomModule {}
