import { Module } from '@nestjs/common';
import { LobbyService } from './lobby.service';
import { GameStateModule } from 'src/shared/game-state.module';

@Module({
  imports: [GameStateModule],
  providers: [LobbyService],
})
export class LobbyModule {}
