import { Module } from '@nestjs/common';
import { LobbyService } from './lobby.service';
import { GameStateModule } from 'src/game-state/game-state.module';
import { LobbyGateway } from './lobby.gateway';

@Module({
  imports: [GameStateModule],
  providers: [LobbyService, LobbyGateway],
  exports: [LobbyService],
})
export class LobbyModule {}
