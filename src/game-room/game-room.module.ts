import { Module } from '@nestjs/common';

import { GameStateModule } from 'src/shared/game-state.module';
import { GameRoomService } from './game-room.service';
import { GameMechanicsService } from './game-mechanics.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema } from './schema/game.schema';

@Module({
  imports: [
    GameStateModule,
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }])
  ],
  providers: [GameRoomService, GameMechanicsService],
})
export class GameRoomModule {}
