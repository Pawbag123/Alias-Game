import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { GameStateService } from 'src/game-state/game-state.service';

@Injectable()
export class TooFewPlayersGuard implements CanActivate {
  constructor(private gameStateService: GameStateService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const gameId = client.data.gameId;

    // Fetch the game details
    if (this.gameStateService.checkIfGameHasTooFewPlayers(gameId)) {
      throw new WsException('Not enough players to start the game');
    }

    return true;
  }
}
