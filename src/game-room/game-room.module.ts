import { Module } from '@nestjs/common';
import { GameStateModule } from 'src/shared/game-state.module';
import { GameRoomService } from './game-room.service';
import { GameMechanicsService } from './game-mechanics.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Games, DbGameSchema } from './schema/game.schema'; // Import DbGame and DbGameSchema

@Module({
  imports: [
    GameStateModule,
    MongooseModule.forFeature([{ name: Games.name, schema: DbGameSchema }]) // Use DbGame
  ],
  providers: [GameRoomService, GameMechanicsService],
})
export class GameRoomModule {}
