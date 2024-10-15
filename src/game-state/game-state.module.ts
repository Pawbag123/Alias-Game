import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameStateService } from './game-state.service';
import { Games, DbGameSchema } from 'src/game-room/schema/game.schema';
import { User, UserSchema } from 'src/auth/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Games.name, schema: DbGameSchema },
      { name: User.name, schema: UserSchema },
    ]), // Register DbGame model
  ],
  providers: [GameStateService],
  exports: [GameStateService],
})
export class GameStateModule {}
