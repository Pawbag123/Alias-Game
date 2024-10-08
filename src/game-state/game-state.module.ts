import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameStateService } from './game-state.service';
import { Games, DbGameSchema } from 'src/game-room/schema/game.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Games.name, schema: DbGameSchema }]), // Register DbGame model
  ],
  providers: [GameStateService],
  exports: [GameStateService],
})
export class GameStateModule {}